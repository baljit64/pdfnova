 "use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Form } from "antd";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const onFinish = () => {
    setLoading(true);
    // Placeholder: replace with real auth (e.g. Supabase)
    setTimeout(() => {
      setLoading(false);
      alert("Login is not connected yet. Use your own auth backend.");
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Login</h1>
      <p className="text-gray-600 mb-8">Sign in to access your account.</p>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: "Please enter your email." }]}
        >
          <Input type="email" size="large" placeholder="you@example.com" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please enter your password." }]}
        >
          <Input.Password size="large" placeholder="••••••••" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" danger htmlType="submit" size="large" block loading={loading}>
            Sign in
          </Button>
        </Form.Item>
      </Form>

      <p className="text-center text-gray-600 text-sm">
        Don&apos;t have an account? <Link href="/" className="text-red-500 hover:underline">Get started for free</Link>
      </p>
    </div>
  );
}
