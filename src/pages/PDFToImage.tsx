import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
// import MetaTags from "../seo/MetaTags";

// Required worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function PDFToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const convertToImages = async () => {
    if (!file) return;

    setLoading(true);
    setImages([]);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      setImages((prev) => [...prev, canvas.toDataURL("image/png")]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* <MetaTags
        title="PDF to Image Converter – Free PDF to PNG"
        description="Convert PDF pages into high-quality images online for free. Fast, secure and works in your browser."
        canonical="/pdf-to-image"
      /> */}

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">PDF to Image</h1>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={convertToImages}
          disabled={!file || loading}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Converting..." : "Convert to Images"}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {images.map((img, index) => (
            <a
              key={index}
              href={img}
              download={`page-${index + 1}.png`}
              className="border p-2 block"
            >
              <img src={img} alt={`Page ${index + 1}`} />
              <p className="text-center text-sm mt-2">
                Download Page {index + 1}
              </p>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
