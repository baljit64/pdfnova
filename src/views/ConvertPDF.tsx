import Link from "next/link";
import { Card } from "antd";
import { PictureOutlined } from "@ant-design/icons";

export default function ConvertPDF() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Convert PDF</h1>
      <p className="text-gray-600 mb-12">Choose a conversion tool below.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg rounded-xl text-center hover:shadow-xl transition-shadow">
          <div className="text-4xl text-blue-600 mb-4"><PictureOutlined /></div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">PDF to Image</h2>
          <p className="text-gray-600 mb-4">Convert PDF pages to PNG images.</p>
          <Link href="/pdf-to-image" className="inline-flex rounded-md bg-red-500 px-4 py-2 font-semibold text-white no-underline hover:bg-red-600">PDF to Image</Link>
        </Card>
        <Card className="shadow-lg rounded-xl text-center hover:shadow-xl transition-shadow">
          <div className="text-4xl text-blue-600 mb-4"><PictureOutlined /></div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">PDF to JPG</h2>
          <p className="text-gray-600 mb-4">Convert each PDF page into a JPG.</p>
          <Link href="/pdf-to-jpg" className="inline-flex rounded-md bg-red-500 px-4 py-2 font-semibold text-white no-underline hover:bg-red-600">PDF to JPG</Link>
        </Card>
        <Card className="shadow-lg rounded-xl text-center hover:shadow-xl transition-shadow">
          <div className="text-4xl text-blue-600 mb-4"><PictureOutlined /></div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">JPG to PDF</h2>
          <p className="text-gray-600 mb-4">Convert JPG images to PDF in seconds.</p>
          <Link href="/jpg-to-pdf" className="inline-flex rounded-md bg-red-500 px-4 py-2 font-semibold text-white no-underline hover:bg-red-600">JPG to PDF</Link>
        </Card>
      </div>
    </div>
  );
}
