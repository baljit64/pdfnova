import { useState } from "react";
import { PDFDocument } from "pdf-lib";
// import MetaTags from "../seo/MetaTags";

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompress = async () => {
    if (!file) return;

    setLoading(true);

    try {
      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Save with compression options
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      // Download
      const blob = new Blob([compressedPdfBytes], {
        type: "application/pdf",
      });
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
    <>
      {/* <MetaTags
        title="Compress PDF Online – Free PDF Compressor"
        description="Reduce PDF file size online for free. Fast, secure, and works directly in your browser."
      /> */}

      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Compress PDF</h1>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleCompress}
          disabled={!file || loading}
          className="block mt-4 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Compressing..." : "Compress PDF"}
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Note: Browser-based compression gives medium results.
          High compression will be available in Pro version.
        </p>
      </div>
    </>
  );
}
