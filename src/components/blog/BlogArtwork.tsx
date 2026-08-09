import type { BlogPost } from "../../blog/posts";

const themes: Record<BlogPost["visual"], { background: string; ink: string; soft: string }> = {
  compress: { background: "bg-[#fff1ef]", ink: "#ef4444", soft: "#fecaca" },
  merge: { background: "bg-[#eef5ff]", ink: "#2563eb", soft: "#bfdbfe" },
  split: { background: "bg-[#f2efff]", ink: "#7c3aed", soft: "#ddd6fe" },
  images: { background: "bg-[#ecfdf5]", ink: "#059669", soft: "#a7f3d0" },
  privacy: { background: "bg-[#eff6ff]", ink: "#0f4c81", soft: "#bae6fd" },
  study: { background: "bg-[#fff8e8]", ink: "#d97706", soft: "#fde68a" },
};

export default function BlogArtwork({
  visual,
  className = "",
}: {
  visual: BlogPost["visual"];
  className?: string;
}) {
  const theme = themes[visual];

  return (
    <div
      className={`${theme.background} ${className} relative overflow-hidden`}
      aria-hidden="true"
    >
      <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/50" />
      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/40" />
      <svg viewBox="0 0 480 280" className="relative h-full w-full" fill="none">
        {visual === "compress" && (
          <>
            <rect x="80" y="45" width="145" height="190" rx="14" fill="white" />
            <path d="M179 45v48h46" fill={theme.soft} />
            <path d="M180 45l45 48" stroke={theme.soft} strokeWidth="5" />
            <rect x="107" y="125" width="92" height="11" rx="5.5" fill={theme.soft} />
            <rect x="107" y="151" width="70" height="11" rx="5.5" fill={theme.soft} />
            <path d="M249 112h72m0 0-24-24m24 24-24 24" stroke={theme.ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="342" y="82" width="76" height="124" rx="12" fill="white" />
            <path d="M388 82v29h30" fill={theme.soft} />
            <path d="M388 82l30 29" stroke={theme.soft} strokeWidth="4" />
            <rect x="358" y="139" width="44" height="8" rx="4" fill={theme.ink} opacity=".5" />
            <rect x="358" y="158" width="34" height="8" rx="4" fill={theme.soft} />
          </>
        )}

        {visual === "merge" && (
          <>
            <rect x="74" y="61" width="126" height="162" rx="13" fill={theme.soft} transform="rotate(-9 74 61)" />
            <rect x="105" y="48" width="126" height="162" rx="13" fill="white" />
            <path d="M187 48v42h44" fill={theme.soft} />
            <path d="M188 48l43 42" stroke={theme.soft} strokeWidth="5" />
            <rect x="130" y="116" width="76" height="10" rx="5" fill={theme.soft} />
            <rect x="130" y="141" width="58" height="10" rx="5" fill={theme.soft} />
            <path d="M250 140h60" stroke={theme.ink} strokeWidth="12" strokeLinecap="round" />
            <path d="M294 116l25 24-25 24" stroke={theme.ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="337" y="48" width="103" height="176" rx="13" fill="white" />
            <path d="M401 48v38h39" fill={theme.soft} />
            <path d="M402 48l38 38" stroke={theme.soft} strokeWidth="5" />
            <rect x="357" y="113" width="62" height="9" rx="4.5" fill={theme.ink} opacity=".45" />
            <rect x="357" y="136" width="50" height="9" rx="4.5" fill={theme.soft} />
            <rect x="357" y="159" width="57" height="9" rx="4.5" fill={theme.soft} />
          </>
        )}

        {visual === "split" && (
          <>
            <rect x="162" y="44" width="156" height="192" rx="14" fill="white" />
            <path d="M266 44v48h52" fill={theme.soft} />
            <path d="M267 44l51 48" stroke={theme.soft} strokeWidth="5" />
            <path d="M240 88v106" stroke={theme.ink} strokeWidth="7" strokeDasharray="10 12" strokeLinecap="round" />
            <circle cx="240" cy="143" r="19" fill={theme.soft} stroke={theme.ink} strokeWidth="6" />
            <path d="M221 143l-64-54m64 54-64 54m102-54 64-54m-64 54 64 54" stroke={theme.ink} strokeWidth="9" strokeLinecap="round" />
            <circle cx="147" cy="80" r="13" fill="white" stroke={theme.ink} strokeWidth="7" />
            <circle cx="147" cy="206" r="13" fill="white" stroke={theme.ink} strokeWidth="7" />
            <circle cx="333" cy="80" r="13" fill="white" stroke={theme.ink} strokeWidth="7" />
            <circle cx="333" cy="206" r="13" fill="white" stroke={theme.ink} strokeWidth="7" />
          </>
        )}

        {visual === "images" && (
          <>
            <rect x="66" y="65" width="123" height="150" rx="13" fill="white" transform="rotate(-7 66 65)" />
            <circle cx="114" cy="106" r="16" fill={theme.soft} />
            <path d="M78 187l38-45 23 24 23-32 31 56" fill={theme.soft} />
            <rect x="145" y="53" width="123" height="150" rx="13" fill="white" transform="rotate(6 145 53)" />
            <circle cx="195" cy="94" r="15" fill={theme.soft} />
            <path d="M158 172l37-42 24 22 23-30 29 54" fill={theme.ink} opacity=".28" />
            <path d="M285 140h49m0 0-19-19m19 19-19 19" stroke={theme.ink} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="357" y="48" width="92" height="174" rx="13" fill="white" />
            <path d="M411 48v38h38" fill={theme.soft} />
            <path d="M412 48l37 38" stroke={theme.soft} strokeWidth="5" />
            <text x="379" y="158" fill={theme.ink} fontSize="25" fontWeight="800">PDF</text>
          </>
        )}

        {visual === "privacy" && (
          <>
            <rect x="91" y="50" width="157" height="188" rx="14" fill="white" />
            <path d="M198 50v49h50" fill={theme.soft} />
            <path d="M199 50l49 49" stroke={theme.soft} strokeWidth="5" />
            <rect x="119" y="128" width="98" height="10" rx="5" fill={theme.soft} />
            <rect x="119" y="153" width="76" height="10" rx="5" fill={theme.soft} />
            <path d="M324 79c25 17 48 20 67 21v54c0 47-28 72-67 90-39-18-67-43-67-90v-54c19-1 42-4 67-21Z" fill={theme.ink} />
            <rect x="298" y="141" width="52" height="47" rx="8" fill="white" />
            <path d="M308 141v-12c0-22 32-22 32 0v12" stroke="white" strokeWidth="11" strokeLinecap="round" />
            <circle cx="324" cy="162" r="6" fill={theme.ink} />
            <path d="M324 166v9" stroke={theme.ink} strokeWidth="5" strokeLinecap="round" />
          </>
        )}

        {visual === "study" && (
          <>
            <path d="M87 79c49-18 98-12 148 15v139c-50-27-99-33-148-15V79Z" fill="white" />
            <path d="M393 79c-49-18-98-12-148 15v139c50-27 99-33 148-15V79Z" fill="white" />
            <path d="M240 96v136" stroke={theme.soft} strokeWidth="8" />
            <path d="M112 114c36-8 68-3 96 10M112 142c36-8 68-3 96 10M112 170c36-8 68-3 96 10M368 114c-36-8-68-3-96 10M368 142c-36-8-68-3-96 10" stroke={theme.soft} strokeWidth="9" strokeLinecap="round" />
            <path d="M327 178l18 18 40-49" stroke={theme.ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M116 53l10 21 22 10-22 10-10 21-10-21-22-10 22-10 10-21Z" fill={theme.ink} />
          </>
        )}
      </svg>
    </div>
  );
}
