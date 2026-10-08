import { isDomainWhitelisted } from './safeDomains.js';
import { runLocalMLClassification } from './mlEngine.js';

const BACKEND_API = 'http://localhost:5000/api/scan/quick-check';
const DASHBOARD_URL = 'http://localhost:5173';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;


// ========================================================
// CYVORA BADGE FUNCTION
// ========================================================
// ML Safety Score:
// 75 - 100  -> TRUSTED -> GREEN TICK
// 0  - 74   -> UNTRUSTED -> RED CROSS
// ========================================================

function setCyvoraBadge(tabId, score) {

  const numericScore = Number(score);

  console.log(
    'CYVORA BADGE SCORE:',
    numericScore
  );


  // --------------------------------------------------------
  // Invalid score
  // --------------------------------------------------------

  if (!Number.isFinite(numericScore)) {

    chrome.action.setBadgeText({
      tabId: tabId,
      text: '?'
    });

    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: '#475569'
    });

    return;
  }


  // --------------------------------------------------------
  // TRUSTED
  // --------------------------------------------------------

  if (numericScore >= 75) {

    chrome.action.setBadgeText({
      tabId: tabId,
      text: '✓'
    });

    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: '#10B981'
    });

    console.log(
      'CYVORA STATUS: TRUSTED'
    );

  }


  // --------------------------------------------------------
  // UNTRUSTED
  // --------------------------------------------------------

  else {

    chrome.action.setBadgeText({
      tabId: tabId,
      text: '✕'
    });

    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: '#EF4444'
    });

    console.log(
      'CYVORA STATUS: UNTRUSTED'
    );
  }
}


// ========================================================
// BEFORE NAVIGATION
// ========================================================
// As soon as user navigates to a URL,
// run local ML immediately.
// This makes sure the badge does not stay "...".
// ========================================================

chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {

    // Only inspect main frame
    if (details.frameId !== 0) return;


    try {

      const url = new URL(details.url);


      // Only inspect HTTP / HTTPS
      if (
        !['http:', 'https:'].includes(url.protocol)
      ) {

        chrome.action.setBadgeText({
          tabId: details.tabId,
          text: '?'
        });

        chrome.action.setBadgeBackgroundColor({
          tabId: details.tabId,
          color: '#475569'
        });

        return;
      }


      // ----------------------------------------------------
      // RUN LOCAL ML
      // ----------------------------------------------------

      const localML =
        runLocalMLClassification(details.url);


      console.log(
        'CYVORA BEFORE NAVIGATION:',
        url.hostname
      );

      console.log(
        'CYVORA LOCAL ML RESULT:',
        localML
      );

      console.log(
        'CYVORA LOCAL ML SCORE:',
        localML.score
      );


      // ----------------------------------------------------
      // IMMEDIATE BADGE
      // ----------------------------------------------------

      setCyvoraBadge(
        details.tabId,
        localML.score
      );

    } catch (error) {

      console.error(
        'Cyvora before-navigation error:',
        error
      );


      chrome.action.setBadgeText({
        tabId: details.tabId,
        text: '?'
      });

      chrome.action.setBadgeBackgroundColor({
        tabId: details.tabId,
        color: '#475569'
      });
    }

  }
);


// ========================================================
// PAGE COMPLETED
// ========================================================

chrome.webNavigation.onCompleted.addListener(
  async (details) => {

    // Only inspect main frame
    if (details.frameId !== 0) return;


    try {

      const url =
        new URL(details.url);


      // Only HTTP / HTTPS
      if (
        !['http:', 'https:'].includes(url.protocol)
      ) {

        return;
      }


      const domain =
        url.hostname.toLowerCase();


      // ====================================================
      // RUN LOCAL ML
      // ====================================================
      // IMPORTANT:
      // Pass complete URL so pathname keywords such as
      // /login, /verify-account etc. are also analysed.
      // ====================================================

      const localML =
        runLocalMLClassification(details.url);


      console.log(
        'CYVORA FINAL LOCAL ML:',
        domain,
        localML
      );


      let evalResult = null;


      // ====================================================
      // TIER 0: WHITELIST CHECK
      // ====================================================

      if (isDomainWhitelisted(domain)) {

        evalResult = {
          ...localML,
          isWhitelisted: true
        };

      }


      // ====================================================
      // NON-WHITELISTED DOMAIN
      // ====================================================

      else {

        // --------------------------------------------------
        // TIER 1: 12-HOUR CACHE
        // --------------------------------------------------

        const storageKey =
          `cyv_cache_${domain}`;


        const cached =
          await chrome.storage.local.get(
            storageKey
          );


        const now =
          Date.now();


        if (
          cached[storageKey] &&
          (
            now -
            cached[storageKey].timestamp
            <
            TWELVE_HOURS_MS
          )
        ) {

          evalResult =
            cached[storageKey].data;


          console.log(
            'CYVORA CACHE HIT:',
            domain
          );

        }


        else {

          // ------------------------------------------------
          // TIER 2: LOCAL ML
          // ------------------------------------------------

          if (localML.score < 45) {

            evalResult =
              localML;


            console.log(
              'CYVORA LOCAL ML DECISION:',
              localML.score
            );

          }


          // ------------------------------------------------
          // TIER 3: BACKEND VERIFICATION
          // ------------------------------------------------

          else {

            try {

              const res =
                await fetch(
                  `${BACKEND_API}?domain=${encodeURIComponent(domain)}`
                );


              if (res.ok) {

                evalResult =
                  await res.json();

                console.log(
                  'CYVORA BACKEND RESULT:',
                  evalResult
                );

              }

              else {

                evalResult =
                  localML;

                console.log(
                  'CYVORA BACKEND FAILED:',
                  res.status
                );
              }

            }

            catch (error) {

              console.error(
                'CYVORA BACKEND ERROR:',
                error
              );


              evalResult =
                localML;
            }
          }


          // ------------------------------------------------
          // ADD EXTRA DATA
          // ------------------------------------------------

          evalResult.displayLabel =
            `${evalResult.score}`;


          evalResult.isWhitelisted =
            false;


          // ------------------------------------------------
          // SAVE CACHE
          // ------------------------------------------------

          await chrome.storage.local.set({

            [storageKey]: {
              timestamp: now,
              data: evalResult
            }

          });

        }
      }


      // ====================================================
      // FINAL BADGE
      // ====================================================
      // IMPORTANT:
      // Badge is based on LOCAL ML SCORE.
      //
      // This guarantees:
      //
      // >= 75 -> GREEN ✓
      // < 75  -> RED ✕
      //
      // Backend cannot accidentally change the badge.
      // ====================================================

      setCyvoraBadge(
        details.tabId,
        localML.score
      );


      // ====================================================
      // SAVE RESULT FOR POPUP
      // ====================================================

      await chrome.storage.local.set({

        [`tab_score_${details.tabId}`]:
          evalResult

      });


      // ====================================================
      // SEND RESULT TO CONTENT SCRIPT
      // ====================================================

      chrome.tabs.sendMessage(
        details.tabId,

        {
          action: 'RENDER_SHIELD_UI',

          payload: {

            ...evalResult,

            domain: domain,

            fullUrl: details.url,

            dashboardUrl: DASHBOARD_URL

          }
        }

      ).catch(() => {});


    }

    catch (err) {

      console.error(
        'CYVORA onCompleted error:',
        err
      );


      chrome.action.setBadgeText({
        tabId: details.tabId,
        text: '?'
      });


      chrome.action.setBadgeBackgroundColor({
        tabId: details.tabId,
        color: '#475569'
      });

    }

  }
);


// ========================================================
// NAVIGATION ERROR
// ========================================================
// If suspicious site fails to load,
// onCompleted may never execute.
// So we analyse it again here.
// ========================================================

chrome.webNavigation.onErrorOccurred.addListener(
  (details) => {

    // Only inspect main frame
    if (details.frameId !== 0) return;


    try {

      const url =
        new URL(details.url);


      if (
        !['http:', 'https:'].includes(url.protocol)
      ) {

        return;
      }


      // ----------------------------------------------------
      // RUN LOCAL ML EVEN IF PAGE FAILED
      // ----------------------------------------------------

      const localML =
        runLocalMLClassification(details.url);


      console.log(
        'CYVORA NAVIGATION ERROR:',
        url.hostname
      );


      console.log(
        'CYVORA ERROR ML SCORE:',
        localML.score
      );


      // ----------------------------------------------------
      // SHOW BADGE
      // ----------------------------------------------------

      setCyvoraBadge(
        details.tabId,
        localML.score
      );

    }

    catch (error) {

      console.error(
        'CYVORA navigation error handler:',
        error
      );


      chrome.action.setBadgeText({
        tabId: details.tabId,
        text: '?'
      });


      chrome.action.setBadgeBackgroundColor({
        tabId: details.tabId,
        color: '#475569'
      });

    }

  }
);