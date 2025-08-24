# Extension Guide

## Dev
1. `cd extension && npm i && npm run dev`
2. Open Chrome → `chrome://extensions` → Enable Developer mode → Load unpacked → select `extension/dist`.
3. Open any form page → click the extension → Upload document → Review extracted fields → Autofill.

## Build
- `npm run build` → outputs `dist/`.

## Usage Tips
- Use the **Preview** toggle to see values before filling.
- Use **Dry Run** to simulate without changing the page.
- **Templates** persist common mappings per site.
