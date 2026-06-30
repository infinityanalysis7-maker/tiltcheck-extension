/**
 * TiltCheck Service Worker (Manifest V3)
 * Zero external networking. Zero analytics. Zero telemetry.
 * Only responsibility: intercept the emergency message and redirect the tab.
 */

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === 'EMERGENCY_REDIRECT') {
    if (sender.tab && sender.tab.id) {
      chrome.tabs.update(sender.tab.id, {
        url: 'https://tiltcheck.vercel.app'
      });
    }
  }
  return false; // Synchronous handler (no async response needed)
});
