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
            // RUN ML CLASSIFICATION
            // =================================

            const result =
                runLocalMLClassification(tab.url);


            const score = result.score;


            console.log("CYVORA ML RESULT:", result);
            console.log("CYVORA ML SCORE:", score);


            // =================================
            // FINAL DECISION
            // =================================

            if (score >= TRUST_THRESHOLD) {

                setStatus(
                    statusElement,
                    messageElement,
                    "TRUSTED",
                    `Website appears safe - ML Score: ${score}`
                );

            } else {

                setStatus(
                    statusElement,
                    messageElement,
                    "UNTRUSTED",
                    `Security concerns detected - ML Score: ${score}`
                );
            }


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