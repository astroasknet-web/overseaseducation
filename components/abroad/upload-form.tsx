"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { uploadDocAction, type UploadState } from "@/app/abroad/actions";
import { Alert } from "@/components/portal/ui";

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="min-h-[48px] px-6 rounded-lg bg-orange hover:bg-orange-dark disabled:opacity-60 text-white font-semibold text-[15px]">{pending ? "Scanning and uploading..." : "Upload"}</button>;
}

export function UploadForm({ types }: { types: Record<string, string> }) {
  const [s, action] = useActionState(uploadDocAction, {} as UploadState);
  return (
    <form action={action} className="grid sm:grid-cols-[14rem_1fr_auto] gap-3 items-end">
      <div className="sm:col-span-3">
        {s.error ? <Alert>{s.error}</Alert> : null}
        {s.ok ? <Alert kind="success">Uploaded. A counselor will check it.</Alert> : null}
      </div>
      <div><label htmlFor="doc_type" className="block text-[13px] font-medium text-ink-2 mb-1">Document type</label>
        <select id="doc_type" name="doc_type" defaultValue="passport" className="w-full min-h-[48px] px-3 rounded-lg border border-black/[0.15] bg-white text-[15px]">{Object.entries(types).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      <div><label htmlFor="file" className="block text-[13px] font-medium text-ink-2 mb-1">File (PDF, JPG, PNG or DOCX, up to 8 MB)</label>
        <input id="file" name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,.docx" className="block w-full text-[14px] min-h-[48px] py-2.5" /></div>
      <Submit />
    </form>
  );
}
