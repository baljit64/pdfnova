import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ApplySEO from "../seo/ApplySEO";
import JsonLd from "../seo/JsonLd";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ApplySEO />
      <JsonLd />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
