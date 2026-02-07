import { useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument, rgb } from "pdf-lib";
import { Button, Card, Input } from "antd";

export default function SignPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [signatureText, setSignatureText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    if (!file || (!signatureText.trim())) {
      alert("Please upload a PDF and enter your signature text.");
      return;
    }
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const pages = doc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width } = lastPage.getSize();

      lastPage.drawText(signatureText.trim(), {
        x: width - 180,
        y: 40,
        size: 14,
        color: rgb(0, 0, 0),
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "signed.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to sign PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link to="/" className="text-red-500 font-medium hover:underline mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Sign PDF</h1>
      <p className="text-gray-600 mb-8">Sign yourself or request electronic signatures from others.</p>
      <Card className="shadow-lg rounded-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a PDF file</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
        />
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Your signature (text)</label>
          <Input value={signatureText} onChange={(e) => setSignatureText(e.target.value)} placeholder="Type your name or signature" />
        </div>
        <p className="text-xs text-gray-500 mt-1">Signature will be placed at the bottom-right of the last page.</p>
        <Button type="primary" danger size="large" className="mt-6" onClick={handleSign} disabled={!file || !signatureText.trim() || loading} loading={loading}>
          Sign & Download
        </Button>
      </Card>
      <p className="text-sm text-gray-500 mt-4">Draw-to-sign and image stamp coming soon.</p>
    </div>
  );
}
