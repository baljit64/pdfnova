import ToolCard from "../components/tools/ToolCard";
import Container from "../components/ui/Container";
import SectionHeading from "../components/ui/SectionHeading";

const CONVERTERS = [
  { id: "pdf-to-image", title: "PDF to PNG", description: "Convert selected PDF pages to high-quality PNG images." },
  { id: "pdf-to-jpg", title: "PDF to JPG", description: "Render each selected PDF page as a compact JPG image." },
  { id: "jpg-to-pdf", title: "JPG to PDF", description: "Arrange JPG images and combine them into one polished PDF." },
  { id: "pdf-to-word", title: "PDF to Word", description: "Turn PDF content into an editable DOCX document." },
  { id: "word-to-pdf", title: "Word to PDF", description: "Convert DOC and DOCX documents into dependable PDF files." },
  { id: "excel-to-pdf", title: "Excel to PDF", description: "Lay out spreadsheet data as clear, readable PDF tables." },
];

export default function ConvertPDF() {
  return (
    <div className="bg-[var(--page)] py-16 sm:py-20">
      <Container>
        <SectionHeading level="h1" eyebrow="Convert" title="Convert files to and from PDF" description="Choose the format you have and the result you need." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CONVERTERS.map((tool) => (
            <ToolCard key={tool.id} id={tool.id} href={`/${tool.id}`} title={tool.title} description={tool.description} />
          ))}
        </div>
      </Container>
    </div>
  );
}
