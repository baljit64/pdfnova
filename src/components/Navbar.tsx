import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="border-b p-4 flex justify-between">
      <Link to="/" className="font-bold text-lg">PDF Tools</Link>
      <div className="space-x-4">
        <Link to="/merge-pdf">Merge PDF</Link>
      </div>
    </nav>
  );
}
