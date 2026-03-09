import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/Layout";
import Home from "./pages/Home/index";
import MergePDF from "./pages/MergePDF";
import SplitPDF from "./pages/SplitPDF";
import CompressPDF from "./pages/CompressPDF";
import PDFToWord from "./pages/PDFToWord";
import PDFToPowerPoint from "./pages/PDFToPowerPoint";
import PDFToExcel from "./pages/PDFToExcel";
import WordToPDF from "./pages/WordToPDF";
import PowerPointToPDF from "./pages/PowerPointToPDF";
import ExcelToPDF from "./pages/ExcelToPDF";
import EditPDF from "./pages/EditPDF";
import PDFToJpg from "./pages/PDFToJpg";
import PDFToImage from "./pages/PDFToImage";
import JpgToPDF from "./pages/JpgToPDF";
import SignPDF from "./pages/SignPDF";
import Watermark from "./pages/Watermark";
import RotatePDF from "./pages/RotatePDF";
import ConvertPDF from "./pages/ConvertPDF";
import Help from "./pages/Help";
import Login from "./pages/Login";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/merge-pdf" element={<MergePDF />} />
          <Route path="/split-pdf" element={<SplitPDF />} />
          <Route path="/compress-pdf" element={<CompressPDF />} />
          <Route path="/pdf-to-word" element={<PDFToWord />} />
          <Route path="/pdf-to-powerpoint" element={<PDFToPowerPoint />} />
          <Route path="/pdf-to-excel" element={<PDFToExcel />} />
          <Route path="/word-to-pdf" element={<WordToPDF />} />
          <Route path="/powerpoint-to-pdf" element={<PowerPointToPDF />} />
          <Route path="/excel-to-pdf" element={<ExcelToPDF />} />
          <Route path="/edit-pdf" element={<EditPDF />} />
          <Route path="/pdf-to-jpg" element={<PDFToJpg />} />
          <Route path="/pdf-to-image" element={<PDFToImage />} />
          <Route path="/jpg-to-pdf" element={<JpgToPDF />} />
          <Route path="/sign-pdf" element={<SignPDF />} />
          <Route path="/watermark" element={<Watermark />} />
          <Route path="/rotate-pdf" element={<RotatePDF />} />
          <Route path="/convert-pdf" element={<ConvertPDF />} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
