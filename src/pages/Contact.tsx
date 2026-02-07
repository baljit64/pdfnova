import { useState } from "react";
import { Button, Input, Form } from "antd";
import { Link } from "react-router-dom";

const { TextArea } = Input;

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onFinish = () => {
    setLoading(true);
    // Placeholder: replace with real backend or email service
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Message sent</h1>
        <p className="text-gray-600 mb-6">Thanks for reaching out. We&apos;ll get back to you soon.</p>
        <Link to="/">
          <Button type="primary" danger>Back to home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Contact us</h1>
      <p className="text-gray-600 mb-8">Have a question or feedback? Send us a message.</p>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter your name." }]}
        >
          <Input size="large" placeholder="Your name" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: "Please enter your email." }]}
        >
          <Input type="email" size="large" placeholder="you@example.com" />
        </Form.Item>
        <Form.Item
          name="message"
          label="Message"
          rules={[{ required: true, message: "Please enter your message." }]}
        >
          <TextArea rows={5} placeholder="Your message..." />
        </Form.Item>
        <Form.Item>
          <Button type="primary" danger htmlType="submit" size="large" block loading={loading}>
            Send message
          </Button>
        </Form.Item>
      </Form>

      <p className="text-center text-gray-500 text-sm mt-6">
        <Link to="/" className="text-red-500 hover:underline">← Back to home</Link>
      </p>
    </div>
  );
}
