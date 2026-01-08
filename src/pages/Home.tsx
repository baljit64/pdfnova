// import MetaTags from "../seo/MetaTags";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      {/* <MetaTags
        title="Free Online PDF Tools"
        description="Merge, compress and convert PDFs online for free."
      /> */}
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold">Online PDF Tools</h1>
        <p className="mt-2">Fast, secure, free</p>
        <Link
          to="/merge-pdf"
          className="inline-block mt-4 px-4 py-2 bg-black text-white rounded"
        >
          Merge PDF
        </Link>
      </div>
    </>
  );
}
