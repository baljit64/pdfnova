import { useState } from "react";
import PDFUploader from "../components/PDFUploader";
import { mergePDFs } from "../utils/pdfUtils.ts";
import MetaTags from "../seo/MetaTags";

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);

  const handleMerge = async () => {
    const merged = await mergePDFs(files);
    const blob = new Blob([merged], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <>
      {/* <MetaTags
        title="Merge PDF Online"
        description="Combine multiple PDF files into one PDF."
      /> */}

      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Merge PDF</h2>
        <PDFUploader onFilesSelect={setFiles} />
        <button
          onClick={handleMerge}
          disabled={files.length < 2}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Merge Now
        </button>
      </div>
    </>
  );
}
