import { scanFields, fillFields } from "./scanner.js";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.kind === "ScanFields") {
      const schema = scanFields(document);
      sendResponse({ ok: true, schema });
    } else if (msg.kind === "FillFields") {
      fillFields(document, msg.pairs || []);
      sendResponse({ ok: true });
    }
  })();
  return true;
});
