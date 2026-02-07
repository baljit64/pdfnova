import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "antd";
import { imagesToPDF } from "../utils/pdfUtils";

export default function JpgToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const pdfBytes = await imagesToPDF(files);
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to create PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link to="/" className="text-red-500 font-medium hover:underline mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-blue-900 mb-2">JPG to PDF</h1>
      <p className="text-gray-600 mb-8">Convert JPG images to PDF in seconds. Easily adjust orientation and margins.</p>
      <Card className="shadow-lg rounded-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select image files (JPG or PNG)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
        />
        <p className="text-sm text-gray-500 mt-2">Order of selection = order of pages in the PDF.</p>
        <Button type="primary" danger size="large" className="mt-6" onClick={handleConvert} disabled={files.length === 0 || loading} loading={loading}>
          Create PDF
        </Button>
      </Card>
    </div>
  );
}
