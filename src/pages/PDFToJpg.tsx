 "use client";

import { useState } from "react";
import Link from "next/link";
import * as pdfjsLib from "pdfjs-dist";
import { Button, Card } from "antd";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function PDFToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const convertToJpg = async () => {
    if (!file) return;
    setLoading(true);
    setImages([]);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const newImages: string[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        newImages.push(canvas.toDataURL("image/jpeg", 0.92));
      }
      setImages(newImages);
    } catch (err) {
      console.error(err);
      alert("Failed to convert PDF to JPG.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/" className="text-red-500 font-medium hover:underline mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-blue-900 mb-2">PDF to JPG</h1>
      <p className="text-gray-600 mb-8">Convert each PDF page into a JPG or extract all images contained in a PDF.</p>
      <Card className="shadow-lg rounded-xl mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a PDF file</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setImages([]);
          }}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
        />
        <Button type="primary" danger size="large" className="mt-6" onClick={convertToJpg} disabled={!file || loading} loading={loading}>
          {loading ? "Converting..." : "Convert to JPG"}
        </Button>
      </Card>
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((img, index) => (
            <Card key={index} className="overflow-hidden">
              <img src={img} alt={`Page ${index + 1}`} className="w-full rounded" />
              <a href={img} download={`page-${index + 1}.jpg`} className="mt-3 block text-center text-red-500 font-medium hover:underline">
                Download Page {index + 1}
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
