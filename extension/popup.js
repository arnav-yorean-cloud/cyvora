// ===============================
// CYVORA SHIELD - ML BASED POPUP
// ===============================

import { runLocalMLClassification } from "./mlEngine.js";

const TRUST_THRESHOLD = 75;


// --------------------------------
// Set Status
// --------------------------------
function setStatus(statusElement, messageElement, status, message) {

    statusElement.innerText = status;

    statusElement.className =
        "status " + status.toLowerCase();

    messageElement.innerText = message;
}


// --------------------------------
// Get Active Tab
// --------------------------------
chrome.tabs.query(
    {
        active: true,
        currentWindow: true
    },

    function (tabs) {

        const statusElement =
            document.getElementById("statusDisplay");

        const domainElement =
            document.getElementById("domainDisplay");

        const messageElement =
            document.getElementById("messageDisplay");

        const inspectLink =
            document.getElementById("inspectLink");


        // Check HTML elements
        if (
            !statusElement ||
            !domainElement ||
            !messageElement ||
            !inspectLink
        ) {
            console.error(
                "Cyvora: Required popup elements not found."
            );

            return;
        }


        const tab = tabs[0];


        // No active tab
        if (!tab || !tab.url) {

            setStatus(
                statusElement,
                messageElement,
                "UNKNOWN",
                "Unable to inspect this page"
            );

            return;
        }


        try {

            const url = new URL(tab.url);

            const hostname = url.hostname.toLowerCase();


            // Show domain
            domainElement.innerText = hostname;


            // Recon link
            inspectLink.href =
                "http://localhost:5173/?targetUrl=" +
                encodeURIComponent(tab.url) +
                "&autoScan=true";


            // Browser internal pages
            if (
                url.protocol !== "http:" &&
                url.protocol !== "https:"
            ) {

                setStatus(
                    statusElement,
                    messageElement,
                    "UNKNOWN",
                    "This browser page cannot be inspected"
                );

                return;
            }


            // =================================
            // READ COMBINED RESULT FROM STORAGE
            // =================================

            chrome.storage.local.get([`tab_score_${tab.id}`], function (res) {
                const stored = res[`tab_score_${tab.id}`];

                // agar site load hone me fail hui ya exist nahi karti
                if (stored && stored.isUnreachable) {
                    setStatus(
                        statusElement,
                        messageElement,
                        "UNREACHABLE",
                        "This site cannot be reached or does not exist"
                    );
                    return;
                }

                // agar combined score storage me hai toh wahi use hoga warna local ML fallback
                const finalScore = stored && Number.isFinite(Number(stored.score))
                    ? Number(stored.score)
                    : runLocalMLClassification(tab.url).score;

                if (finalScore >= 60) {
                    setStatus(
                        statusElement,
                        messageElement,
                        "TRUSTED",
                        "Website verified and infrastructure safe"
                    );
                } else if (finalScore >= 45) {
                    setStatus(
                        statusElement,
                        messageElement,
                        "WARNING",
                        "Moderate security anomalies detected"
                    );
                } else {
                    setStatus(
                        statusElement,
                        messageElement,
                        "UNTRUSTED",
                        "Critical security threat flagged"
                    );
                }
            });


        } catch (error) {

            console.error(
                "Cyvora popup error:",
                error
            );

            setStatus(
                statusElement,
                messageElement,
                "UNKNOWN",
                "Could not inspect this domain"
            );
        }

    }
);