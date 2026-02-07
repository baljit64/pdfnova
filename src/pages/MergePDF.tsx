import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "antd";
import { DeleteOutlined, RotateRightOutlined, DownloadOutlined, UndoOutlined } from "@ant-design/icons";
import PDFUploader from "../components/PDFUploader";
import { mergePDFsWithOptions } from "../utils/pdfUtils";

const ROTATION_STEPS = [0, 90, 180, 270] as const;

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [excludedIndices, setExcludedIndices] = useState<Set<number>>(new Set());
  const [rotations, setRotations] = useState<number[]>([]);

  const buildMerge = useCallback(async () => {
    if (files.length === 0) return null;
    const excluded = Array.from(excludedIndices);
    const includedCount = files.length - excluded.length;
    if (includedCount === 0) return null;
    const merged = await mergePDFsWithOptions(files, {
      excludedIndices: excluded,
      rotations: rotations.length === files.length ? rotations : files.map(() => 0),
    });
    return new Blob([merged as BlobPart], { type: "application/pdf" });
  }, [files, excludedIndices, rotations]);

  const handleMerge = async () => {
    setLoading(true);
    try {
      const initialRotations = files.map(() => 0);
      setRotations(initialRotations);
      const merged = await mergePDFsWithOptions(files, {
        excludedIndices: [],
        rotations: initialRotations,
      });
      const blob = new Blob([merged as BlobPart], { type: "application/pdf" });
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    } catch (err) {
      console.error(err);
      alert("Failed to merge PDFs.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromMerge = (index: number) => {
    setExcludedIndices((prev) => new Set(prev).add(index));
  };

  const addBackToMerge = (index: number) => {
    setExcludedIndices((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const rotateFile = (index: number) => {
    setRotations((prev) => {
      const list = prev.length === files.length ? [...prev] : files.map(() => 0);
      const current = list[index] ?? 0;
      list[index] = ROTATION_STEPS[(ROTATION_STEPS.indexOf(current as 0 | 90 | 180 | 270) + 1) % 4];
      return list;
    });
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = "merged.pdf";
    a.click();
  };

  const startOver = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFiles([]);
    setExcludedIndices(new Set());
    setRotations([]);
  };

  useEffect(() => {
    if (!previewUrl || files.length === 0) return;
    let cancelled = false;
    buildMerge().then((blob) => {
      if (cancelled || !blob) return;
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [excludedIndices, rotations, buildMerge, files.length]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const isExcluded = (i: number) => excludedIndices.has(i);
  const includedCount = files.length - excludedIndices.size;
  const showPreview = previewUrl != null && files.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/" className="text-red-500 font-medium hover:underline mb-6 inline-block">← Back to home</Link>

      <h1 className="text-3xl font-bold text-blue-900 mb-2">Merge PDF</h1>
      <p className="text-gray-600 mb-8">Combine multiple PDF files into one.</p>

      {!showPreview ? (
        <Card className="shadow-lg rounded-xl">
          <PDFUploader onFilesSelect={setFiles} />
          <p className="text-sm text-gray-500 mt-2">Select two or more PDF files.</p>
          <Button
            type="primary"
            danger
            size="large"
            className="mt-6"
            onClick={handleMerge}
            disabled={files.length < 2}
            loading={loading}
          >
            Merge & Preview
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="shadow-lg rounded-xl">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Preview</h2>
            <div className="border rounded-lg bg-gray-100 overflow-hidden" style={{ minHeight: "480px" }}>
              <iframe
                title="Merged PDF preview"
                src={previewUrl}
                className="w-full h-[480px] border-0"
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button type="primary" danger icon={<DownloadOutlined />} size="large" onClick={handleDownload}>
                Download merged.pdf
              </Button>
              <Button icon={<UndoOutlined />} size="large" onClick={startOver}>
                Start over
              </Button>
            </div>
          </Card>

          <Card className="shadow-lg rounded-xl">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Source files</h2>
            <p className="text-sm text-gray-500 mb-4">
              Remove a file from the merge or rotate it. Changes update the preview above.
            </p>
            <ul className="space-y-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className={`flex items-center justify-between gap-4 py-2 px-3 rounded border ${
                    isExcluded(i) ? "bg-gray-100 border-gray-200 opacity-70" : "bg-white border-gray-200"
                  }`}
                >
                  <span className="truncate text-sm font-medium text-gray-800">{file.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {isExcluded(i) ? (
                      <Button type="link" size="small" onClick={() => addBackToMerge(i)}>
                        Add back
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="primary"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeFromMerge(i)}
                          disabled={includedCount <= 1}
                        >
                          Remove
                        </Button>
                        <Button size="small" icon={<RotateRightOutlined />} onClick={() => rotateFile(i)}>
                          {(rotations[i] ?? 0) === 0 ? "0°" : `${rotations[i]}°`}
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
