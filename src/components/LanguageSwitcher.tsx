"use client";

import { GlobalOutlined, DownOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import Script from "next/script";
import { useCallback, useEffect, useSyncExternalStore } from "react";

type Direction = "ltr" | "rtl";

type Language = {
  code: string;
  displayCode: string;
  googleCode: string;
  name: string;
  direction?: Direction;
};

export const LANGUAGES: Language[] = [
  { code: "en", displayCode: "EN", googleCode: "en", name: "English" },
  { code: "vi", displayCode: "VI", googleCode: "vi", name: "Tiếng Việt" },
  { code: "ar", displayCode: "AR", googleCode: "ar", name: "العربية", direction: "rtl" },
  { code: "cs", displayCode: "CS", googleCode: "cs", name: "Čeština" },
  { code: "de", displayCode: "DE", googleCode: "de", name: "Deutsch" },
  { code: "es", displayCode: "ES", googleCode: "es", name: "Español" },
  { code: "fr", displayCode: "FR", googleCode: "fr", name: "Français" },
  { code: "hi", displayCode: "HI", googleCode: "hi", name: "हिन्दी" },
  { code: "id", displayCode: "ID", googleCode: "id", name: "Bahasa Indonesia" },
  { code: "it", displayCode: "IT", googleCode: "it", name: "Italiano" },
  { code: "ja", displayCode: "JA", googleCode: "ja", name: "日本語" },
  { code: "ko", displayCode: "KO", googleCode: "ko", name: "한국어" },
  { code: "pl", displayCode: "PL", googleCode: "pl", name: "Polski" },
  { code: "pt", displayCode: "PT", googleCode: "pt", name: "Português" },
  { code: "ro", displayCode: "RO", googleCode: "ro", name: "Română" },
  { code: "ru", displayCode: "RU", googleCode: "ru", name: "Русский" },
  { code: "th", displayCode: "TH", googleCode: "th", name: "ภาษาไทย" },
  { code: "tr", displayCode: "TR", googleCode: "tr", name: "Türkçe" },
  { code: "uk", displayCode: "UK", googleCode: "uk", name: "Українська" },
  { code: "zh-CN", displayCode: "ZH-CN", googleCode: "zh-CN", name: "简体中文" },
  { code: "zh-TW", displayCode: "ZH-TW", googleCode: "zh-TW", name: "繁體中文" },
  { code: "ms", displayCode: "MS", googleCode: "ms", name: "Bahasa Melayu" },
  { code: "hu", displayCode: "HU", googleCode: "hu", name: "Magyar" },
  { code: "nl", displayCode: "NL", googleCode: "nl", name: "Nederlands" },
  { code: "el", displayCode: "EL", googleCode: "el", name: "Ελληνικά" },
  { code: "he", displayCode: "HE", googleCode: "iw", name: "עברית", direction: "rtl" },
  { code: "fa", displayCode: "FA", googleCode: "fa", name: "فارسی", direction: "rtl" },
  { code: "nb", displayCode: "NO", googleCode: "no", name: "Norsk bokmål" },
  { code: "sv", displayCode: "SV", googleCode: "sv", name: "Svenska" },
  { code: "fi", displayCode: "FI", googleCode: "fi", name: "Suomi" },
];

const STORAGE_KEY = "pdfnova-language";
const TRANSLATE_ELEMENT_ID = "pdfnova-google-translate";
const TRANSLATE_READY_EVENT = "pdfnova-google-translate-ready";
const INCLUDED_LANGUAGES = LANGUAGES.map((language) => language.googleCode).join(",");

type TranslateElementConstructor = new (
  options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
  elementId: string
) => unknown;

declare global {
  interface Window {
    pdfnovaGoogleTranslateInit?: () => void;
    pdfnovaGoogleTranslateReady?: boolean;
    google?: {
      translate?: {
        TranslateElement?: TranslateElementConstructor;
      };
    };
  }
}

if (typeof window !== "undefined") {
  window.pdfnovaGoogleTranslateInit = () => {
    window.pdfnovaGoogleTranslateReady = true;
    window.dispatchEvent(new Event(TRANSLATE_READY_EVENT));
  };
}

function findLanguage(code: string | null | undefined): Language {
  if (!code) return LANGUAGES[0];
  return (
    LANGUAGES.find((language) => language.code === code) ??
    LANGUAGES.find((language) => language.googleCode === code) ??
    LANGUAGES[0]
  );
}

function languageFromBrowser(): Language {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) return findLanguage(stored);

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("googtrans="));
  const translatedCode = cookie?.split("/").at(-1);
  return findLanguage(translatedCode);
}

function subscribeToLanguage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function browserLanguageSnapshot() {
  return languageFromBrowser().code;
}

function serverLanguageSnapshot() {
  return "en";
}

function cookieDomains(): Array<string | undefined> {
  const hostname = window.location.hostname;
  if (hostname === "pdfnova.in" || hostname.endsWith(".pdfnova.in")) {
    return [undefined, ".pdfnova.in"];
  }
  return [undefined];
}

function setTranslationCookie(googleCode: string | null) {
  for (const domain of cookieDomains()) {
    const domainPart = domain ? `; domain=${domain}` : "";
    if (googleCode) {
      document.cookie = `googtrans=/en/${googleCode}; path=/; max-age=31536000; SameSite=Lax${domainPart}`;
    } else {
      document.cookie = `googtrans=; path=/; max-age=0; SameSite=Lax${domainPart}`;
    }
  }
}

function applyDocumentLanguage(language: Language) {
  document.documentElement.lang = language.code;
  document.documentElement.dir = language.direction ?? "ltr";
}

function LanguageMenu({
  selected,
  onSelect,
}: {
  selected: Language;
  onSelect: (language: Language) => void;
}) {
  return (
    <div
      className="notranslate w-[min(92vw,760px)] p-4 sm:p-6"
      translate="no"
      aria-label="Choose a language"
    >
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-slate-500 sm:text-sm">
        Language
      </p>
      <div className="grid max-h-[min(68vh,690px)] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:gap-3">
        {LANGUAGES.map((language) => {
          const active = language.code === selected.code;
          return (
            <button
              key={language.code}
              type="button"
              lang={language.code}
              dir={language.direction ?? "ltr"}
              aria-pressed={active}
              onClick={() => onSelect(language)}
              className={`min-h-12 rounded-xl border-0 px-4 py-3 text-start text-sm font-semibold transition sm:min-h-14 sm:px-5 sm:text-base ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-900 hover:bg-slate-100 hover:text-blue-700"
              }`}
            >
              {language.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LanguageSwitcher() {
  const selectedCode = useSyncExternalStore(
    subscribeToLanguage,
    browserLanguageSnapshot,
    serverLanguageSnapshot
  );
  const selected = findLanguage(selectedCode);

  const initializeTranslator = useCallback(() => {
    const TranslateElement = window.google?.translate?.TranslateElement;
    const container = document.getElementById(TRANSLATE_ELEMENT_ID);
    if (!TranslateElement || !container || container.childElementCount > 0) return;

    new TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: INCLUDED_LANGUAGES,
        autoDisplay: false,
      },
      TRANSLATE_ELEMENT_ID
    );
  }, []);

  useEffect(() => {
    applyDocumentLanguage(selected);
    window.addEventListener(TRANSLATE_READY_EVENT, initializeTranslator);
    if (window.pdfnovaGoogleTranslateReady) initializeTranslator();
    return () => window.removeEventListener(TRANSLATE_READY_EVENT, initializeTranslator);
  }, [initializeTranslator, selected]);

  const selectLanguage = (language: Language) => {
    if (language.code === selected.code) return;

    applyDocumentLanguage(language);
    window.localStorage.setItem(STORAGE_KEY, language.code);
    setTranslationCookie(language.code === "en" ? null : language.googleCode);
    window.location.reload();
  };

  return (
    <>
      <Popover
        content={<LanguageMenu selected={selected} onSelect={selectLanguage} />}
        trigger="click"
        placement="bottomRight"
        arrow={false}
        classNames={{ root: "pdfnova-language-popover" }}
        styles={{ container: { borderRadius: 16, padding: 0, overflow: "hidden" } }}
      >
        <button
          type="button"
          className="notranslate inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:gap-2 sm:px-3"
          translate="no"
          aria-label={`Language: ${selected.name}`}
        >
          <GlobalOutlined aria-hidden="true" />
          <span className="text-xs font-bold tracking-[0.16em] text-slate-500">
            {selected.displayCode}
          </span>
          <span className="hidden xl:inline">Language</span>
          <DownOutlined className="text-[10px]" aria-hidden="true" />
        </button>
      </Popover>

      <div id={TRANSLATE_ELEMENT_ID} aria-hidden="true" />
      <Script
        id="pdfnova-google-translate-script"
        src="https://translate.google.com/translate_a/element.js?cb=pdfnovaGoogleTranslateInit"
        strategy="afterInteractive"
      />
    </>
  );
}
