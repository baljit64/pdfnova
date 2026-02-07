import { Link } from "react-router-dom";
import { Button } from "antd";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-blue-900 mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">{description}</p>
      <p className="text-gray-500 text-sm mb-8">
        This tool requires server-side processing. We&apos;re working on bringing it to you soon.
      </p>
      <Link to="/">
        <Button type="primary" danger>Back to all tools</Button>
      </Link>
    </div>
  );
}
