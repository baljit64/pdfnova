import { useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import { Button, Card } from "antd";

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompress = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([compressedPdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Compression failed:", err);
      alert("Failed to compress PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link to="/" className="text-red-500 font-medium hover:underline mb-6 inline-block">← Back to home</Link>

      <h1 className="text-3xl font-bold text-blue-900 mb-2">Compress PDF</h1>
      <p className="text-gray-600 mb-8">Reduce PDF file size easily.</p>

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
          onClick={handleCompress}
          disabled={!file || loading}
          loading={loading}
        >
          {loading ? "Compressing..." : "Compress PDF"}
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          Processing happens in your browser. For higher compression, consider a desktop tool.
        </p>
      </Card>
    </div>
  );
}
