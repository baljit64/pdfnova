 "use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card } from "antd";
import mammoth from "mammoth";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function WordToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "210mm";
      container.style.padding = "20mm";
      container.style.background = "white";
      container.style.fontFamily = "Arial, sans-serif";
      container.style.fontSize = "12pt";
      container.style.lineHeight = "1.5";
      container.style.color = "#000";
      container.innerHTML = html;
      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      let imgWidth = contentWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > contentHeight) {
        const scale = contentHeight / imgHeight;
        imgHeight = contentHeight;
        imgWidth = imgWidth * scale;
      }

      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
      pdf.save("converted.pdf");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to convert Word to PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="text-red-500 font-medium hover:underline mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Word to PDF</h1>
      <p className="text-gray-600 mb-8">Make DOC and DOCX files easy to read by converting them to PDF.</p>
      <Card className="shadow-lg rounded-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a Word file (DOC or DOCX)</label>
        <input
          type="file"
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
        />
        <Button type="primary" danger size="large" className="mt-6" onClick={handleConvert} disabled={!file || loading} loading={loading}>
          Convert to PDF
        </Button>
        <p className="text-sm text-gray-500 mt-4">Uses Mammoth (DOCX→HTML) and jsPDF. Long documents are scaled to fit one page.</p>
      </Card>
    </div>
  );
}
