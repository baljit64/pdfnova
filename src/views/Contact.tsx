 "use client";

import { useState } from "react";
import { Alert, Button, Input, Form } from "antd";
import Link from "next/link";

const { TextArea } = Input;

interface ContactValues {
  name: string;
  email: string;
  message: string;
  website?: string;
}

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: ContactValues) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || "We could not send your message.");

      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not send your message.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Message sent</h1>
        <p className="text-gray-600 mb-6">Thanks for reaching out. We&apos;ll get back to you soon.</p>
        <Link href="/">
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
          <Input size="large" placeholder="Your name" maxLength={100} autoComplete="name" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: "Please enter your email." }]}
        >
          <Input
            type="email"
            size="large"
            placeholder="you@example.com"
            maxLength={254}
            autoComplete="email"
          />
        </Form.Item>
        <Form.Item
          name="message"
          label="Message"
          rules={[{ required: true, message: "Please enter your message." }]}
        >
          <TextArea rows={5} placeholder="Your message..." maxLength={5000} showCount />
        </Form.Item>
        <Form.Item name="website" className="hidden" aria-hidden="true">
          <Input tabIndex={-1} autoComplete="off" />
        </Form.Item>
        {error && (
          <Alert className="mb-6" type="error" showIcon message="Message not sent" description={error} />
        )}
        <Form.Item>
          <Button type="primary" danger htmlType="submit" size="large" block loading={loading}>
            Send message
          </Button>
        </Form.Item>
      </Form>

      <p className="text-sm leading-6 text-gray-500">
        Do not include passwords, payment information or confidential document contents in your
        message. See the <Link href="/privacy" className="text-red-500 hover:underline">Privacy Policy</Link>.
      </p>

      <p className="text-center text-gray-500 text-sm mt-6">
        <Link href="/" className="text-red-500 hover:underline">← Back to home</Link>
      </p>
    </div>
  );
}
