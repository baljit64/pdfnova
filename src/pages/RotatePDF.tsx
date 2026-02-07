import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Radio } from "antd";
import { rotatePDF } from "../utils/pdfUtils";

const ANGLES = [90, 180, 270] as const;

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<0 | 90 | 180 | 270>(90);
  const [loading, setLoading] = useState(false);

  const handleRotate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const rotated = await rotatePDF(file, angle);
      const blob = new Blob([rotated as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rotated.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to rotate PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link to="/" className="text-red-500 font-medium hover:underline mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Rotate PDF</h1>
      <p className="text-gray-600 mb-8">Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!</p>
      <Card className="shadow-lg rounded-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a PDF file</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
        />
        <div className="mt-4">
          <span className="text-sm font-medium text-gray-700 mr-3">Rotation:</span>
          <Radio.Group value={angle} onChange={(e) => setAngle(e.target.value)}>
            {ANGLES.map((a) => (
              <Radio key={a} value={a}>{a}°</Radio>
            ))}
          </Radio.Group>
        </div>
        <Button type="primary" danger size="large" className="mt-6" onClick={handleRotate} disabled={!file || loading} loading={loading}>
          Rotate & Download
        </Button>
      </Card>
    </div>
  );
}
