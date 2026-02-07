import { useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument, rgb } from "pdf-lib";
import { Button, Card, Input, InputNumber } from "antd";

export default function EditPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(700);
  const [size, setSize] = useState(12);
  const [loading, setLoading] = useState(false);

  const handleAddText = async () => {
    if (!file || !text.trim()) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const pages = doc.getPages();
      const pageIndex = Math.max(0, Math.min(pageNum - 1, pages.length - 1));
      const page = pages[pageIndex];
      const { height } = page.getSize();
      page.drawText(text.trim(), {
        x,
        y: height - y,
        size,
        color: rgb(0, 0, 0),
      });
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "edited.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to edit PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link to="/" className="text-red-500 font-medium hover:underline mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Edit PDF</h1>
      <p className="text-gray-600 mb-8">Add text, images, shapes or freehand annotations to a PDF document. Edit the size, font, and color of the added content.</p>
      <Card className="shadow-lg rounded-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a PDF file</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
        />
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Text to add</label>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page number</label>
            <InputNumber min={1} value={pageNum} onChange={(v) => setPageNum(v ?? 1)} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font size</label>
            <InputNumber min={6} max={72} value={size} onChange={(v) => setSize(v ?? 12)} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">X position</label>
            <InputNumber value={x} onChange={(v) => setX(v ?? 50)} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Y position (from top)</label>
            <InputNumber value={y} onChange={(v) => setY(v ?? 700)} className="w-full" />
          </div>
        </div>
        <Button type="primary" danger size="large" className="mt-6" onClick={handleAddText} disabled={!file || !text.trim() || loading} loading={loading}>
          Add text & Download
        </Button>
      </Card>
      <p className="text-sm text-gray-500 mt-4">Images and shapes support coming soon.</p>
    </div>
  );
}
