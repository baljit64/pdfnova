import { Button, Card } from "antd";

export default function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
      <Card className="w-[420px] rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-4">
          PDF Tools
        </h1>

        <Button type="primary" size="large" block>
          Upload PDF
        </Button>
      </Card>
    </div>
  );
}
