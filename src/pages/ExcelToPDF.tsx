import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "antd";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExcelToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        raw: false,
      });

      if (data.length === 0) {
        alert("The sheet is empty.");
        setLoading(false);
        return;
      }

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const head = data[0] as string[];
      const body = data.slice(1).map((row) => (row as unknown[]).map((c) => String(c ?? "")));

      autoTable(doc, {
        head: [head],
        body,
        startY: 20,
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save("converted.pdf");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to convert Excel to PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link to="/" className="text-red-500 font-medium hover:underline mb-6 inline-block">← Back to home</Link>
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Excel to PDF</h1>
      <p className="text-gray-600 mb-8">Make EXCEL spreadsheets easy to read by converting them to PDF.</p>
      <Card className="shadow-lg rounded-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select an Excel file (XLS or XLSX)</label>
        <input
          type="file"
          accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
        />
        <Button type="primary" danger size="large" className="mt-6" onClick={handleConvert} disabled={!file || loading} loading={loading}>
          Convert to PDF
        </Button>
        <p className="text-sm text-gray-500 mt-4">First sheet is converted to a table. Uses SheetJS (xlsx) and jsPDF-autotable.</p>
      </Card>
    </div>
  );
}
