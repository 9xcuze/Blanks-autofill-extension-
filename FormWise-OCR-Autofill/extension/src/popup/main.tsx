import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import Fuse from "fuse.js";

const DocSchema = z.object({
  fullName: z.string().min(2).optional(),
  dob: z.string().optional(),
  aadhaar: z.string().optional(),
  pan: z.string().optional(),
  address: z.string().optional()
});

type DocInfo = z.infer<typeof DocSchema>;

function App() {
  const [schema, setSchema] = useState<{ fields: any[] } | null>(null);
  const [doc, setDoc] = useState<DocInfo>({});
  const [pairs, setPairs] = useState<{ fieldId: string; value: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(true);

  async function requestScan() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const res = await chrome.tabs.sendMessage(tab.id!, { kind: "ScanFields" });
    setSchema(res.schema);
  }

  function parseOCRText(text: string): DocInfo {
    const out: DocInfo = {};
    const nameMatch = text.match(/Name[:\s]+([A-Z][A-Za-z\s]+)/i);
    if (nameMatch) out.fullName = nameMatch[1].trim();
    const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]/i);
    if (panMatch) out.pan = panMatch[0].toUpperCase();
    const aadhaarMatch = text.replace(/\s/g,'').match(/\d{12}/);
    if (aadhaarMatch) out.aadhaar = aadhaarMatch[0];
    const dobMatch = text.match(/(\d{2}[-\/]\d{2}[-\/]\d{4})/);
    if (dobMatch) out.dob = dobMatch[1];
    return out;
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    // Simple client-side OCR using Tesseract shipped in vendor (loaded dynamically)
    const { createWorker } = await import("../vendor/tesseract.min.js");
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data } = await worker.recognize(file);
    await worker.terminate();
    const parsed = parseOCRText(data.text || "");
    const safe = DocSchema.parse(parsed);
    setDoc(safe);
    setBusy(false);
  }

  function suggestPairs() {
    if (!schema) return;
    const fuse = new Fuse(schema.fields, { keys: ["label"], threshold: 0.4 });
    const out: { fieldId: string; value: string }[] = [];
    const candidates: Record<string,string|undefined> = {
      "name": doc.fullName,
      "full name": doc.fullName,
      "pan": doc.pan,
      "aadhaar": doc.aadhaar,
      "dob": doc.dob,
      "date of birth": doc.dob,
      "address": doc.address
    };
    for (const [k,v] of Object.entries(candidates)) {
      if (!v) continue;
      const hit = fuse.search(k)[0];
      if (hit) out.push({ fieldId: hit.item.id, value: v });
    }
    setPairs(out);
  }

  async function autofill() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id!, { kind: "FillFields", pairs });
  }

  useEffect(() => { requestScan(); }, []);

  return (
    <div className="p-4 w-[360px] space-y-3">
      <h1 className="text-xl font-semibold">FormWise</h1>
      <div className="card">
        <label className="btn bg-gray-100 inline-block cursor-pointer">
          Upload Document
          <input type="file" onChange={onFile} accept="image/*,.pdf" className="hidden" />
        </label>
        {busy && <p className="text-sm mt-2">Running OCR…</p>}
        {doc && <pre className="bg-gray-50 p-2 rounded mt-2 text-xs">{JSON.stringify(doc, null, 2)}</pre>}
      </div>
      <div className="card">
        <div className="flex items-center justify-between">
          <span className="font-medium">Preview mode</span>
          <input type="checkbox" checked={preview} onChange={e=>setPreview(e.target.checked)} />
        </div>
        <button className="btn bg-blue-600 text-white mt-2" onClick={suggestPairs}>Suggest Matches</button>
        <button className="btn bg-emerald-600 text-white mt-2" onClick={autofill} disabled={!pairs.length}>
          Autofill {preview ? "(Preview)" : ""}
        </button>
        {!!pairs.length && <pre className="bg-gray-50 p-2 rounded mt-2 text-xs">{JSON.stringify(pairs, null, 2)}</pre>}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
