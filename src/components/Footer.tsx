import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#0b2a4a] text-white py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link to="/about" className="text-white/90 hover:text-white no-underline">About</Link>
          <Link to="/privacy" className="text-white/90 hover:text-white no-underline">Privacy</Link>
          <Link to="/terms" className="text-white/90 hover:text-white no-underline">Terms</Link>
          <Link to="/contact" className="text-white/90 hover:text-white no-underline">Contact</Link>
        </div>

        <p className="text-sm text-gray-300 text-center md:text-left">
          © {new Date().getFullYear()} PDFNova. All rights reserved. Built by Baljit Singh.
        </p>

        <div className="flex gap-3">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            aria-label="Facebook"
          >
            f
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            aria-label="Twitter"
          >
            𝕏
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            aria-label="YouTube"
          >
            ▶
          </a>
        </div>
      </div>
    </footer>
  );
}
