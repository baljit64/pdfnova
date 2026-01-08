import { Button, Card } from "antd";
import {
  FilePdfOutlined,
  CompressOutlined,
  PictureOutlined,
  LockOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
// import MetaTags from "../seo/MetaTags";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* <MetaTags
        title="Free PDF Tools Online – Merge, Compress & Convert PDFs"
        description="Merge, compress & convert PDFs with ease. No installation. 100% secure."
      /> */}

      {/* NAVBAR */}
      <header className="bg-[#eef5ff] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-blue-900">
            PDF<span className="text-red-500">Nova</span>
          </div>

          <nav className="hidden md:flex gap-6 text-gray-700">
            <a href="/merge-pdf">Merge PDF</a>
            <a href="/compress-pdf">Compress PDF</a>
            <a href="/pdf-to-image">Convert PDF</a>
            <a href="#">Help</a>
          </nav>

          <Button danger>Login</Button>
        </div>
      </header>

      {/* HERO */}
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
              <Button
                type="primary"
                size="large"
                danger
                onClick={() => navigate("/merge-pdf")}
              >
                Get Started
              </Button>
              <Button size="large">Watch Demo</Button>
            </div>
          </div>

          {/* Illustration */}
          <div className="hidden md:flex justify-center">
            <img
              src="/assets/hero.png"
              alt="PDF Tools Illustration"
              className="max-w-lg"
            />
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <ToolCard
            icon={<FilePdfOutlined />}
            title="Merge PDF Files"
            desc="Combine multiple PDFs into one."
            btn="Merge PDFs"
            onClick={() => navigate("/merge-pdf")}
          />
          <ToolCard
            icon={<CompressOutlined />}
            title="Compress PDF"
            desc="Reduce PDF file size easily."
            btn="Compress PDF"
            onClick={() => navigate("/compress-pdf")}
          />
          <ToolCard
            icon={<PictureOutlined />}
            title="PDF to Image"
            desc="Convert PDF pages to images."
            btn="PDF to Image"
            onClick={() => navigate("/pdf-to-image")}
          />
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-[#f7fbff] py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Why Choose Us?</h2>

          <div className="grid md:grid-cols-4 gap-8">
            <Feature
              icon={<LockOutlined />}
              title="100% Secure"
              desc="Your files are processed locally."
            />
            <Feature
              icon={<ThunderboltOutlined />}
              title="Fast & Easy"
              desc="Instant PDF processing."
            />
            <Feature
              icon={<CheckCircleOutlined />}
              title="High Quality"
              desc="No watermark. Clean output."
            />
            <Feature
              icon={<MobileOutlined />}
              title="Works on All Devices"
              desc="Mobile, tablet & desktop."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-white to-[#eef5ff] text-center">
        <h2 className="text-3xl font-bold text-blue-900">
          Start Using Our Free PDF Tools Today!
        </h2>
        <Button
          type="primary"
          danger
          size="large"
          className="mt-6"
          onClick={() => navigate("/merge-pdf")}
        >
          Get Started
        </Button>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b2a4a] text-white py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex gap-6 text-sm">
            <a href="#">About</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>

          <p className="text-sm mt-4 md:mt-0 text-gray-300">
            © 2026 PDFToolsOnline. Built by Baljit Singh.
          </p>
        </div>
      </footer>
    </>
  );
}

/* ---------------- Components ---------------- */

function ToolCard({
  icon,
  title,
  desc,
  btn,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  btn: string;
  onClick: () => void;
}) {
  return (
    <Card className="shadow-lg rounded-xl text-center">
      <div className="text-4xl text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600 mt-2">{desc}</p>
      <Button danger className="mt-4" onClick={onClick}>
        {btn}
      </Button>
    </Card>
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
