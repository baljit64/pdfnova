 "use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, Input, InputNumber } from "antd";
import { watermarkPDF } from "../utils/pdfUtils";

export default function Watermark() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("DRAFT");
  const [opacity, setOpacity] = useState(0.3);
  const [loading, setLoading] = useState(false);

  const handleWatermark = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await watermarkPDF(file, text, { opacity, fontSize: 48 });
      const blob = new Blob([result as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "watermarked.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to add watermark.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="text-red-500 font-medium hover:underline mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Watermark</h1>
      <p className="text-gray-600 mb-8">Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.</p>
      <Card className="shadow-lg rounded-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a PDF file</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
        />
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Watermark text</label>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. DRAFT, CONFIDENTIAL" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Opacity (0–1)</label>
          <InputNumber min={0.1} max={1} step={0.1} value={opacity} onChange={(v) => setOpacity(v ?? 0.3)} />
        </div>
        <Button type="primary" danger size="large" className="mt-6" onClick={handleWatermark} disabled={!file || loading} loading={loading}>
          Add watermark & Download
        </Button>
      </Card>
    </div>
  );
}
