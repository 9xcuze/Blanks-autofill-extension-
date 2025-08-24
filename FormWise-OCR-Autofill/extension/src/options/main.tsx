import React from "react";
import { createRoot } from "react-dom/client";

function Options() {
  return (
    <div className="p-4 w-[600px] space-y-3">
      <h1 className="text-xl font-semibold">FormWise – Options</h1>
      <p className="text-sm">Configure preferences like local storage of refresh token, server sync, and privacy settings.</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Options />);
