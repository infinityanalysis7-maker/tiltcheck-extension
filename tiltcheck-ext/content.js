/*
  TiltCheck Content Script — 100% client-side, zero telemetry.
  Dynamically locates chart/order-entry panels on target sites and
  injects a high-urgency emergency cool-down button.
*/

(function () {
  'use strict';

  // Guard against double-injection (iframes or repeated script loads).
  if (window.__tiltcheckEmergencyInjected) return;
  window.__tiltcheckEmergencyInjected = true;

  const HOST = window.location.hostname;

  // Per-site CSS selectors ordered by preference (chart/panel → fallback → body).
  const ANCHOR_SELECTORS = {
    'dexscreener.com': [
      'div[class*="chart"]',
      'div[class*="swap"]',
      'main',
      'body'
    ],
    'pump.fun': [
      'div[class*="chart"]',
      'div[class*="trade"]',
      'main',
      'body'
    ],
    'tradingview.com': [
      '.chart-container',
      '.layout__area--center',
      '[class*="chart-gui"]',
      'body'
    ]
  };

  /**
   * Attempt to locate the most relevant DOM node for button injection.
   * Falls back to document.body if no specific panel is found.
   */
  function getAnchor() {
    const domainKey = Object.keys(ANCHOR_SELECTORS).find((d) => HOST.includes(d));
    if (!domainKey) return document.body;

    for (const sel of ANCHOR_SELECTORS[domainKey]) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return document.body;
  }

  /**
   * Build the emergency button with the required aesthetic.
   */
  function createButton() {
    const btn = document.createElement('button');
    btn.id = 'tiltcheck-emergency-btn';
    btn.className = 'tiltcheck-emergency-btn';
    btn.textContent = 'Emergency Cool-Down';
    btn.title = 'Click to activate TiltCheck and lock your charts';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Hand-off to the MV3 service worker to perform the tab redirect.
      chrome.runtime.sendMessage({ action: 'EMERGENCY_REDIRECT' });
    });

    return btn;
  }

  /**
   * Inject the button into the anchor node if it is not already present.
   */
  function inject() {
    if (document.getElementById('tiltcheck-emergency-btn')) return;

    const anchor = getAnchor();
    const btn = createButton();
    anchor.appendChild(btn);
  }

  // ── Initial injection ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  // ── SPA resilience: re-inject if the button is removed by a route change ──
  const observer = new MutationObserver(() => {
    if (!document.getElementById('tiltcheck-emergency-btn')) {
      inject();
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();
