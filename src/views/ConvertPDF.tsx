 "use client";

import { useRouter } from "next/navigation";
import { Button, Card } from "antd";
import { PictureOutlined } from "@ant-design/icons";

export default function ConvertPDF() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Convert PDF</h1>
      <p className="text-gray-600 mb-12">Choose a conversion tool below.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg rounded-xl text-center hover:shadow-xl transition-shadow">
          <div className="text-4xl text-blue-600 mb-4"><PictureOutlined /></div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">PDF to Image</h2>
          <p className="text-gray-600 mb-4">Convert PDF pages to PNG images.</p>
          <Button type="primary" danger onClick={() => router.push("/pdf-to-image")}>PDF to Image</Button>
        </Card>
        <Card className="shadow-lg rounded-xl text-center hover:shadow-xl transition-shadow">
          <div className="text-4xl text-blue-600 mb-4"><PictureOutlined /></div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">PDF to JPG</h2>
          <p className="text-gray-600 mb-4">Convert each PDF page into a JPG.</p>
          <Button type="primary" danger onClick={() => router.push("/pdf-to-jpg")}>PDF to JPG</Button>
        </Card>
        <Card className="shadow-lg rounded-xl text-center hover:shadow-xl transition-shadow">
          <div className="text-4xl text-blue-600 mb-4"><PictureOutlined /></div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">JPG to PDF</h2>
          <p className="text-gray-600 mb-4">Convert JPG images to PDF in seconds.</p>
          <Button type="primary" danger onClick={() => router.push("/jpg-to-pdf")}>JPG to PDF</Button>
        </Card>
      </div>
    </div>
  );
}
