import { ImageResponse } from "next/og";

export const alt = "PDFNova – Free Online PDF Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function SocialImage() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", padding: "80px", background: "#101d36", color: "white" }}>
      <div style={{ display: "flex", fontSize: 80, fontWeight: 700 }}>
        PDF<span style={{ color: "#ef7668" }}>Nova</span>
      </div>
      <div style={{ display: "flex", marginTop: 38, fontSize: 52 }}>Free Online PDF Tools</div>
      <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "#cbd5e1" }}>Merge · Split · Compress · Convert · Edit</div>
      <div style={{ display: "flex", marginTop: 60, fontSize: 26, color: "#ef7668" }}>www.pdfnova.in</div>
    </div>,
    size,
  );
}
