"use client";

import Link from "next/link";
import Image from "next/image";
import { Button, Popover } from "antd";
import {
  BgColorsOutlined,
  CompressOutlined,
  DownOutlined,
  EditOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FormOutlined,
  MergeOutlined,
  PictureOutlined,
  RotateRightOutlined,
  SplitCellsOutlined,
} from "@ant-design/icons";
import { forwardRef, type ReactNode } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

type ToolLink = {
  href: string;
  label: string;
  icon: ReactNode;
};

type ToolGroup = {
  title: string;
  tools: ToolLink[];
};

const convertGroups: ToolGroup[] = [
  {
    title: "Convert to PDF",
    tools: [
      { href: "/jpg-to-pdf", label: "JPG to PDF", icon: <PictureOutlined /> },
      { href: "/word-to-pdf", label: "Word to PDF", icon: <FileWordOutlined /> },
      { href: "/excel-to-pdf", label: "Excel to PDF", icon: <FileExcelOutlined /> },
    ],
  },
  {
    title: "Convert from PDF",
    tools: [
      { href: "/pdf-to-jpg", label: "PDF to JPG", icon: <FileImageOutlined /> },
      { href: "/pdf-to-image", label: "PDF to PNG", icon: <PictureOutlined /> },
      { href: "/pdf-to-word", label: "PDF to Word", icon: <FileWordOutlined /> },
    ],
  },
];

const allToolGroups: ToolGroup[] = [
  {
    title: "Organize PDF",
    tools: [
      { href: "/merge-pdf", label: "Merge PDF", icon: <MergeOutlined /> },
      { href: "/split-pdf", label: "Split PDF", icon: <SplitCellsOutlined /> },
      { href: "/rotate-pdf", label: "Rotate PDF", icon: <RotateRightOutlined /> },
    ],
  },
  {
    title: "Optimize PDF",
    tools: [
      { href: "/compress-pdf", label: "Compress PDF", icon: <CompressOutlined /> },
    ],
  },
  ...convertGroups,
  {
    title: "Edit PDF",
    tools: [
      { href: "/edit-pdf", label: "Edit PDF", icon: <EditOutlined /> },
      { href: "/watermark", label: "Add watermark", icon: <BgColorsOutlined /> },
      { href: "/sign-pdf", label: "Sign PDF", icon: <FormOutlined /> },
    ],
  },
];

function ToolMenu({ groups, expanded = false }: { groups: ToolGroup[]; expanded?: boolean }) {
  return (
    <div className={expanded ? "grid w-[min(92vw,960px)] grid-cols-2 gap-x-10 gap-y-7 p-2 lg:grid-cols-3" : "grid w-[min(90vw,480px)] grid-cols-1 gap-6 p-2 sm:grid-cols-2"}>
      {groups.map((group) => (
        <section key={group.title} aria-label={group.title}>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{group.title}</h2>
          <div className="space-y-1">
            {group.tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold text-slate-800 no-underline transition hover:bg-slate-100 hover:text-red-500"
              >
                <span className="grid h-7 w-7 place-items-center rounded-md bg-slate-100 text-base text-red-500">
                  {tool.icon}
                </span>
                {tool.label}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const MenuTrigger = forwardRef<HTMLButtonElement, { children: ReactNode }>(function MenuTrigger(
  { children },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className="inline-flex items-center gap-2 whitespace-nowrap border-0 bg-transparent px-1 py-2 text-sm font-bold uppercase tracking-tight text-slate-800 transition hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
    >
      {children}
      <DownOutlined className="text-xs" aria-hidden="true" />
    </button>
  );
});

const primaryLinkClass = "whitespace-nowrap px-1 py-2 text-sm font-bold uppercase tracking-tight text-slate-800 no-underline transition hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-5 sm:px-5 lg:px-6">
        <Link href="/" className="flex shrink-0 no-underline" aria-label="PDFNova home">
          <Image
            src="/assets/pdf-nova-logo-horizontal.png"
            alt="PDFNova"
            width={157}
            height={50}
            priority
            className="h-9 w-auto lg:h-10"
          />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-4 lg:flex xl:gap-7">
          <Link href="/merge-pdf" className={primaryLinkClass}>Merge PDF</Link>
          <Link href="/split-pdf" className={primaryLinkClass}>Split PDF</Link>
          <Link href="/compress-pdf" className={primaryLinkClass}>Compress PDF</Link>
          <Popover
            content={<ToolMenu groups={convertGroups} />}
            trigger={["hover", "click"]}
            placement="bottomLeft"
            arrow={false}
            mouseEnterDelay={0.08}
            mouseLeaveDelay={0.15}
            styles={{ container: { borderRadius: 14, padding: 14 } }}
          >
            <MenuTrigger>Convert PDF</MenuTrigger>
          </Popover>
          <Popover
            content={<ToolMenu groups={allToolGroups} expanded />}
            trigger={["hover", "click"]}
            placement="bottom"
            arrow={false}
            mouseEnterDelay={0.08}
            mouseLeaveDelay={0.15}
            styles={{ container: { borderRadius: 14, padding: 14 } }}
          >
            <MenuTrigger>All PDF Tools</MenuTrigger>
          </Popover>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/" className="hidden text-sm font-semibold text-slate-700 no-underline hover:text-red-500 sm:inline lg:hidden">
            Tools
          </Link>
          <LanguageSwitcher />
          <Link href="/login">
            <Button type="primary" danger>Login</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
