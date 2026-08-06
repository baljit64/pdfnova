import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="mb-2 text-3xl font-bold text-blue-900">Page not found</h1>
      <p className="text-gray-600">
        The page you requested does not exist. Every PDF tool is listed on the{" "}
        <Link href="/" className="text-red-500 hover:underline">
          home page
        </Link>
        .
      </p>
    </div>
  );
}
