 "use client";

import { Button, Card } from "antd";
import {
  MergeOutlined,
  SplitCellsOutlined,
  CompressOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileExcelOutlined,
  EditOutlined,
  PictureOutlined,
  FormOutlined,
  BgColorsOutlined,
  RotateRightOutlined,
  LockOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const TOOLS = [
  {
    path: "/merge-pdf",
    icon: <MergeOutlined />,
    title: "Merge PDF",
    desc: "Combine PDFs in the order you want with the easiest PDF merger available.",
    btn: "Merge PDFs",
  },
  {
    path: "/split-pdf",
    icon: <SplitCellsOutlined />,
    title: "Split PDF",
    desc: "Separate one page or a whole set for easy conversion into independent PDF files.",
    btn: "Split PDF",
  },
  {
    path: "/compress-pdf",
    icon: <CompressOutlined />,
    title: "Compress PDF",
    desc: "Reduce PDF file size with lossless, balanced, strong or target-size options.",
    btn: "Compress PDF",
  },
  {
    path: "/pdf-to-word",
    icon: <FileWordOutlined />,
    title: "PDF to Word",
    desc: "Convert a PDF into an editable DOCX, then review complex layouts in your document editor.",
    btn: "PDF to Word",
  },
  {
    path: "/pdf-to-powerpoint",
    icon: <FilePptOutlined />,
    title: "PDF to PowerPoint",
    desc: "A planned tool for converting PDF files into PowerPoint presentations.",
    btn: "PDF to PPT",
    badge: "Coming soon",
  },
  {
    path: "/pdf-to-excel",
    icon: <FileExcelOutlined />,
    title: "PDF to Excel",
    desc: "A planned tool for converting PDF content into Excel spreadsheets.",
    btn: "PDF to Excel",
    badge: "Coming soon",
  },
  {
    path: "/word-to-pdf",
    icon: <FileWordOutlined />,
    title: "Word to PDF",
    desc: "Make DOC and DOCX files easy to read by converting them to PDF.",
    btn: "Word to PDF",
  },
  {
    path: "/powerpoint-to-pdf",
    icon: <FilePptOutlined />,
    title: "PowerPoint to PDF",
    desc: "A planned tool for converting PPT and PPTX presentations to PDF.",
    btn: "PPT to PDF",
    badge: "Coming soon",
  },
  {
    path: "/excel-to-pdf",
    icon: <FileExcelOutlined />,
    title: "Excel to PDF",
    desc: "Make EXCEL spreadsheets easy to read by converting them to PDF.",
    btn: "Excel to PDF",
  },
  {
    path: "/edit-pdf",
    icon: <EditOutlined />,
    title: "Edit PDF",
    desc: "Add text to a chosen PDF page and control its size and position.",
    btn: "Edit PDF",
    badge: "New!",
  },
  {
    path: "/pdf-to-jpg",
    icon: <PictureOutlined />,
    title: "PDF to JPG",
    desc: "Render each PDF page as a downloadable JPG image.",
    btn: "PDF to JPG",
  },
  {
    path: "/pdf-to-image",
    icon: <PictureOutlined />,
    title: "PDF to Image",
    desc: "Render each PDF page as a downloadable PNG image.",
    btn: "PDF to PNG",
  },
  {
    path: "/jpg-to-pdf",
    icon: <PictureOutlined />,
    title: "JPG to PDF",
    desc: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
    btn: "JPG to PDF",
  },
  {
    path: "/sign-pdf",
    icon: <FormOutlined />,
    title: "Sign PDF",
    desc: "Add a typed signature to a chosen page of a PDF.",
    btn: "Sign PDF",
  },
  {
    path: "/watermark",
    icon: <BgColorsOutlined />,
    title: "Watermark",
    desc: "Stamp a text watermark over every PDF page with adjustable opacity and position.",
    btn: "Watermark",
  },
  {
    path: "/rotate-pdf",
    icon: <RotateRightOutlined />,
    title: "Rotate PDF",
    desc: "Rotate all or selected pages by 90, 180 or 270 degrees.",
    btn: "Rotate PDF",
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-b from-[#eef5ff] to-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight">
              The Best Free PDF Tools <br /> in One Place
            </h1>
            <p className="mt-6 text-lg text-gray-700">
              Merge, Compress & Convert PDFs with Ease.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/merge-pdf"
                className="inline-flex min-h-10 items-center rounded-md bg-red-500 px-5 font-semibold text-white no-underline transition hover:bg-red-600"
              >
                Get Started
              </Link>
              <Button size="large">Watch Demo</Button>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <img src="/assets/hero.png" alt="PDF Tools Illustration" className="max-w-lg" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">All PDF tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {TOOLS.map((tool) => (
              <Card
                key={tool.path}
                className="shadow-lg rounded-xl text-center relative hover:shadow-xl transition-shadow"
              >
                {tool.badge && (
                  <span className="absolute top-3 right-3 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                    {tool.badge}
                  </span>
                )}
                <div className="text-4xl text-blue-600 mb-4">{tool.icon}</div>
                <h3 className="text-lg font-semibold text-blue-900">{tool.title}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">{tool.desc}</p>
                <Link
                  href={tool.path}
                  className="mt-4 inline-flex min-h-8 items-center rounded-md border border-red-500 px-4 font-medium text-red-500 no-underline transition hover:bg-red-50"
                >
                  {tool.btn}
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7fbff] py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Feature icon={<LockOutlined />} title="Private by design" desc="Most tools process files locally; server-assisted tools are clearly identified." />
            <Feature icon={<ThunderboltOutlined />} title="Focused workflow" desc="Choose files, set the available options and download the result." />
            <Feature icon={<CheckCircleOutlined />} title="High Quality" desc="No watermark. Clean output." />
            <Feature icon={<MobileOutlined />} title="Works on All Devices" desc="Mobile, tablet & desktop." />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-[#eef5ff] text-center">
        <h2 className="text-3xl font-bold text-blue-900">Start Using Our Free PDF Tools Today!</h2>
        <Link
          href="/merge-pdf"
          className="mt-6 inline-flex min-h-10 items-center rounded-md bg-red-500 px-5 font-semibold text-white no-underline transition hover:bg-red-600"
        >
          Get Started
        </Link>
      </section>
    </>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center">
      <div className="text-4xl text-blue-700 mb-4">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-gray-600 mt-2">{desc}</p>
    </div>
  );
}
