 "use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card } from "antd";

export default function PDFToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/convert/pdf-to-word", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Conversion failed.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + ".docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="text-red-500 font-medium hover:underline mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-blue-900 mb-2">PDF to Word</h1>
      <p className="text-gray-600 mb-8">Easily convert your PDF files into easy to edit DOC and DOCX documents.</p>

      <Card className="shadow-lg rounded-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a PDF file</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
        />
        <Button
          type="primary"
          danger
          size="large"
          className="mt-6"
          onClick={handleConvert}
          disabled={!file || loading}
          loading={loading}
        >
          Convert to Word
        </Button>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <p className="text-xs text-gray-500 mt-4">
          This feature uses a server-side converter. Set <code>CLOUDCONVERT_API_KEY</code> in your environment.
        </p>
      </Card>
    </div>
  );
}
