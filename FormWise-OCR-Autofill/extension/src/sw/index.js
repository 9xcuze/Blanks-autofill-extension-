chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.kind === "Auth.SaveTokens") {
      await chrome.storage.session.set({ accessToken: msg.accessToken });
      if (msg.refreshToken) {
        await chrome.storage.local.set({ refreshToken: msg.refreshToken });
      }
      sendResponse({ ok: true });
    } else if (msg.kind === "Auth.Logout") {
      await chrome.storage.session.remove("accessToken");
      await chrome.storage.local.remove("refreshToken");
      sendResponse({ ok: true });
    }
  })();
  return true;
});
