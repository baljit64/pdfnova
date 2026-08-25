/**
 * The landing-page variation catalogue.
 *
 * Adding a new landing page means adding an entry here (or listing an existing
 * variation against another tool) — no new component, no new route file.
 *
 * `localOnly: true` marks a variation whose copy claims on-device processing.
 * Those are skipped for server-side tools so no page ever makes a false claim.
 */
import type { ToolDefinition, ToolId } from "../../tools/types";
import type { ContentBlock, FaqItem, ListItem } from "./types";

export interface VariationDefinition {
  id: string;
  /** Appended to the tool slug to form the route, e.g. "-online". */
  slugSuffix: string;
  /** Short human label used in related-page lists. */
  label: string;
  /** Long-tail phrase this page targets. */
  keyword: (tool: ToolDefinition) => string;
  /** Page heading. Keep it close to the keyword without reading like a robot. */
  h1: (tool: ToolDefinition) => string;
  /** Browser tab / SERP title, before the site suffix is appended. */
  titlePrefix: (tool: ToolDefinition) => string;
  description: (tool: ToolDefinition) => string;
  /** Paragraphs shown above the tool. */
  lead: (tool: ToolDefinition) => string[];
  /** The dedicated section that justifies this page existing. */
  section: (tool: ToolDefinition) => ContentBlock;
  benefits: (tool: ToolDefinition) => ListItem[];
  faqs: (tool: ToolDefinition) => FaqItem[];
  /** Copy assumes the file never leaves the device. */
  localOnly?: boolean;
  /** When set, only these tools get this variation. */
  onlyTools?: ToolId[];
}

const lower = (tool: ToolDefinition) => tool.name.toLowerCase();

/* ------------------------------------------------------------------ *
 * Access and pricing angles
 * ------------------------------------------------------------------ */

const online: VariationDefinition = {
  id: "online",
  slugSuffix: "-online",
  label: "Online",
  keyword: (t) => `${lower(t)} online`,
  h1: (t) => `${t.name} Online`,
  titlePrefix: (t) => `${t.name} Online Free`,
  description: (t) =>
    `${t.name} online with no software to install. ${t.blurb} Free, no signup, works in any modern browser.`,
  lead: (t) => [
    `Doing this online means there is nothing to install, nothing to update and nothing to uninstall afterwards. Open this page, add your ${t.acceptLabel} file, and the ${lower(t)} tool is ready — the same tool, with the same options, that powers every other ${lower(t)} page on this site.`,
    `That matters more than it sounds. Desktop PDF software tends to arrive as a large download, ask for administrator rights, install a background updater and then propose a subscription. For a job you might do twice a month, that is a poor trade. An online tool has none of that overhead and is available from whichever computer you happen to be sitting at.`,
    `Everything the desktop version of this job needs is here: file validation before anything runs, live progress while it does, clear errors if something goes wrong, a retry button when it does, and a preview of the result before you commit to downloading it.`,
  ],
  section: (t) => ({
    heading: `Why do this online instead of installing software`,
    paragraphs: [
      `Installed PDF software makes sense if you work with documents all day and need features like redaction, preflight or PDF/A validation. For the specific job of getting a ${t.outputNoun}, it is a lot of machinery for a small task — and licensing usually assumes one machine, which is awkward the moment you are on a different computer.`,
      `An online tool inverts that. There is no licence tied to hardware, no version to keep current, and no install step standing between you and the work. Open the page, do the job, close the tab. If you need it again next month from a different device, it is in exactly the same place and behaves in exactly the same way.`,
      `The one thing an online tool has historically been worse at is privacy, because "online" usually meant "uploaded to somebody's server". That is not how this tool works. The processing runs inside your browser on your own device, so you get the convenience of an online tool without the file ever going anywhere.`,
    ],
  }),
  benefits: (t) => [
    {
      title: "Nothing to install",
      body: `No download, no installer, no administrator password. The ${lower(t)} tool loads with the page and is ready as soon as you add a file.`,
    },
    {
      title: "Available from any machine",
      body: "Work computer, home laptop, a borrowed device — the tool is at the same address with the same features and no licence to move across.",
    },
    {
      title: "Always current",
      body: "There is no version to keep up to date. Whatever improvements have shipped are what you get the next time you open the page.",
    },
  ],
  faqs: (t) => [
    {
      question: `Do I need to install anything to ${t.verb} a ${t.acceptLabel} file online?`,
      answer:
        "No. Everything runs in the browser you are already using. There is no download, no extension and no plugin to add.",
    },
    {
      question: "Does it work in every browser?",
      answer:
        "Any current version of Chrome, Firefox, Safari, Edge, Brave, Opera or Vivaldi will work, on desktop and on mobile. Very old browsers may struggle with larger documents because they lack the memory management newer engines have.",
    },
    {
      question: "Do I need to be online the whole time?",
      answer:
        "You need a connection to load the page. After that, the processing happens on your device, so a brief drop in connectivity part-way through will not interrupt the work.",
    },
  ],
};

const free: VariationDefinition = {
  id: "free",
  slugSuffix: "-free",
  label: "Free",
  keyword: (t) => `free ${lower(t)}`,
  h1: (t) => `${t.name} — Free, No Card Required`,
  titlePrefix: (t) => `Free ${t.name} — No Signup, No Watermark`,
  description: (t) =>
    `${t.name} completely free. ${t.blurb} No trial, no card, no watermark, no daily limit.`,
  lead: (t) => [
    `Free here means free: no card, no trial that expires, no free tier that stops at three files a day, and no watermark stamped across your ${t.outputNoun} to push you towards an upgrade. Add your file, ${t.verb} it, download it, close the tab.`,
    `It is worth being specific, because the word gets abused. Plenty of sites advertise a free ${lower(t)} and then ask for an email before the download, or hand back a file with a logo across every page, or cap you at two files and then show a pricing table. None of that happens here.`,
    `The reason this can be free is structural. Almost every tool on PDFNova runs inside your browser using your own device's processor, so there is no per-file server cost to recover. A tool that costs nothing to run can be given away without a catch behind it.`,
  ],
  section: () => ({
    heading: "What free actually means on this page",
    paragraphs: [
      "No account is required and no email address is collected. You are never asked to register before downloading, and there is no verification step standing between finishing the job and getting the file.",
      "There is no watermark, no branding and no metadata added to the output. The file you download contains your content and nothing else — nobody receiving it can tell what produced it.",
      "There is no usage cap. You can run the tool once or fifty times in an afternoon, and nothing changes on the fiftieth run. There is no queue that free users wait in, no artificial slow-down, and no premium tier that gets a faster version of the same tool.",
      "The honest caveat is that free tools are typically focused rather than exhaustive. This one does its job properly and stops there. If you need document redaction, PDF/A conformance checking or batch scripting across thousands of files, professional software genuinely earns its licence fee — this is not trying to replace it.",
    ],
  }),
  benefits: () => [
    {
      title: "No card, ever",
      body: "There is no payment step, no trial countdown and no pricing page waiting at the end of the process.",
    },
    {
      title: "No watermark on your file",
      body: "The output contains your content only. No logo, no footer, no branding, no identifying metadata.",
    },
    {
      title: "No daily limit",
      body: "Run it as many times as you need. Nothing throttles, queues or locks after a certain number of files.",
    },
  ],
  faqs: (t) => [
    {
      question: "Is this really free, or is there a catch later?",
      answer:
        "It is free with no card, no account and no cap. There is no step at the end where a payment is required to download what you just made.",
    },
    {
      question: `Will there be a watermark on my ${t.outputNoun}?`,
      answer:
        "No. Nothing is added to your file — no logo, no footer, no branding and no metadata identifying the tool that produced it.",
    },
    {
      question: "How many files can I process for free?",
      answer:
        "As many as you like. There is no daily cap, no queue for free users and no throttling after a certain number of runs.",
    },
  ],
};

const withoutSignup: VariationDefinition = {
  id: "without-signup",
  slugSuffix: "-without-signup",
  label: "Without signup",
  keyword: (t) => `${lower(t)} without signup`,
  h1: (t) => `${t.name} Without Signing Up`,
  titlePrefix: (t) => `${t.name} — No Signup or Account Needed`,
  description: (t) =>
    `${t.name} without creating an account. No email, no password, no verification. ${t.blurb}`,
  lead: (t) => [
    `There is no account on this page. No email address, no password to invent, no verification link to go and find, and no marketing list you are quietly added to. Add your ${t.acceptLabel} file and use the tool.`,
    `Registration walls exist to capture your details, not to make the tool work better. Nothing about ${lower(t)} requires knowing who you are — the operation is the same whether the site has your email or not, so asking for it would only slow you down.`,
    `This also means there is nothing to log back into, nothing to remember and nothing to delete later. When you close the tab, the transaction is complete.`,
  ],
  section: () => ({
    heading: "No account, and nothing left behind",
    paragraphs: [
      "Because there is no account, there is no profile holding a history of what you processed. Nothing about this session is associated with an identity, because no identity was ever created.",
      "Your files are handled the same way. Almost every tool here works inside your browser, so files are never uploaded, never stored on a server, and disappear from memory as soon as you close or reload the page. There is no cleanup job deleting your documents later, because they were never anywhere to delete.",
      "The practical upshot is that this page works the same on a shared or public computer as it does on your own. There is no session to forget to log out of and no cached account for the next person to find.",
    ],
  }),
  benefits: () => [
    {
      title: "No email address needed",
      body: "You are never asked for an email, either before using the tool or before downloading the result.",
    },
    {
      title: "No password to manage",
      body: "There is no account, so there is nothing to create, remember, reset or eventually delete.",
    },
    {
      title: "Safe on shared computers",
      body: "Nothing is stored and no session persists, so there is nothing left for the next person who uses the machine.",
    },
  ],
  faqs: () => [
    {
      question: "Do I have to give an email address to download my file?",
      answer:
        "No. The download is available immediately once processing finishes. There is no email gate and no verification step.",
    },
    {
      question: "Is any personal information collected?",
      answer:
        "No account details are collected because there is no account. The site uses standard anonymous analytics to count page views and tool usage, which never includes your file names or file contents.",
    },
    {
      question: "Can I use this on a public or shared computer?",
      answer:
        "Yes. There is no login to leave signed in and no file stored anywhere. Closing the tab clears everything the tool was holding.",
    },
  ],
};

const unlimited: VariationDefinition = {
  id: "unlimited",
  slugSuffix: "-unlimited",
  label: "Unlimited",
  keyword: (t) => `unlimited ${lower(t)}`,
  h1: (t) => `Unlimited ${t.name}`,
  titlePrefix: (t) => `Unlimited ${t.name} — No Daily Limit`,
  description: (t) =>
    `${t.name} with no daily limit and no queue. ${t.blurb} Process as many files as you need.`,
  lead: (t) => [
    `There is no counter on this page. Run the ${lower(t)} tool once, or run it thirty times this afternoon, and the thirtieth run behaves exactly like the first — same speed, same options, same output.`,
    `Daily caps exist on other sites for a straightforward reason: their processing happens on servers that cost money per file, so usage has to be metered. This tool runs on your own device, which means the marginal cost of your next file is zero and there is nothing to meter.`,
    `The same logic removes the queue. You are not waiting behind other people's jobs on shared infrastructure, because the work is happening locally. What limits throughput is your own processor, not somebody else's capacity planning.`,
  ],
  section: (t) => ({
    heading: "What actually limits how much you can process",
    paragraphs: [
      `There is no artificial cap, but there are real, physical limits worth knowing. Individual files are capped at ${t.maxFileSizeMB} MB${t.multiple ? `, and you can add up to ${t.maxFiles} at a time` : ""}. These reflect what a browser tab can comfortably hold in memory rather than a commercial decision.`,
      "The practical ceiling is your device's available memory. A phone with several other tabs open will struggle with a very large document where a laptop would not notice it. If a large job fails, closing other tabs and trying again usually resolves it.",
      "For very large batches, working in groups is more reliable than pushing a single run to its limit. Nothing is lost by doing so — the result of processing in batches is identical to processing everything at once.",
    ],
  }),
  benefits: () => [
    {
      title: "No daily cap",
      body: "There is no per-day, per-hour or per-session file limit. Nothing changes on your tenth or fiftieth run.",
    },
    {
      title: "No queue",
      body: "Work runs on your own device rather than shared servers, so there is nobody ahead of you and no waiting room.",
    },
    {
      title: "No throttling",
      body: "The tool does not slow down after repeated use, and there is no faster paid version of it being held back.",
    },
  ],
  faqs: (t) => [
    {
      question: "Is there really no limit on how many files I can process?",
      answer:
        "No artificial limit. There is no counter, no cooldown and no cap that appears after a certain number of runs. The only real limits are the per-file size cap and your device's memory.",
    },
    {
      question: "Will it get slower if I use it a lot?",
      answer:
        "No. Each run is independent and nothing accumulates between them. If a later run feels slower, it is usually browser memory pressure — reload the page and it will be back to normal.",
    },
    {
      question: `What is the largest file I can use?`,
      answer: `${t.maxFileSizeMB} MB per file${t.multiple ? `, with up to ${t.maxFiles} files in a single run` : ""}. These limits are about what a browser tab can hold comfortably, not about tiering.`,
    },
  ],
};

const fast: VariationDefinition = {
  id: "fast",
  slugSuffix: "-fast",
  label: "Fast",
  localOnly: true,
  keyword: (t) => `fast ${lower(t)}`,
  h1: (t) => `Fast ${t.name}`,
  titlePrefix: (t) => `Fast ${t.name} — No Upload Wait`,
  description: (t) =>
    `${t.name} without waiting for an upload. Processing starts the moment you press the button because your file never leaves your device.`,
  lead: () => [
    `On most online PDF tools, the actual work takes a second or two. Everything else is transport: uploading your file, waiting in a queue, and downloading the result. On a typical home connection, a 20 MB document can spend half a minute in transit before anything happens to it.`,
    `This tool removes that entirely. Your file is read straight from your device into the browser tab, processed there, and handed back as a download. There is no upload, no queue and no return trip, so the only time spent is the processing itself.`,
    `The practical difference grows with file size and shrinks with connection quality. On fibre with a small file you might not notice. On a mobile connection with a large scanned document, the difference is the difference between a few seconds and a few minutes.`,
  ],
  section: () => ({
    heading: "Where the time actually goes",
    paragraphs: [
      "A conventional online tool spends its time in four stages: uploading your file, waiting for a worker to pick it up, processing, then downloading the result. On a 10 Mbps upstream connection — typical for home broadband — a 25 MB file takes about twenty seconds just to reach the server, and the same again is spent in reverse if the output is a similar size.",
      "Running locally cuts three of those four stages. Reading a file from your own disk into a browser tab happens at hundreds of megabytes per second, which is effectively instant at these sizes. What remains is the processing, which for most operations is a fraction of a second per page.",
      "This is also why the tool behaves the same on a poor connection. Once the page has loaded, network speed stops being a factor — a job on tethered mobile data runs at exactly the same speed as one on a wired connection.",
    ],
  }),
  benefits: () => [
    {
      title: "No upload wait",
      body: "Files are read directly from your device. There is no transfer step before processing can begin.",
    },
    {
      title: "No queue",
      body: "Nothing is waiting for a server worker to become free. The work starts the moment you press the button.",
    },
    {
      title: "Connection-independent",
      body: "After the page loads, your connection speed no longer affects how long the job takes.",
    },
  ],
  faqs: () => [
    {
      question: "How long does it actually take?",
      answer:
        "For most operations, well under a second per page. Anything involving re-rendering pages — compression and image conversion — is slower, in the region of a few tenths of a second per page on a modern laptop. Long documents show live progress so you always know where you are.",
    },
    {
      question: "Why is it faster than other online tools?",
      answer:
        "Because it skips the upload, the queue and the download of the result. Those three stages usually account for most of the wall-clock time on a conventional online tool, and none of them exist here.",
    },
    {
      question: "Does a slow internet connection make it slower?",
      answer:
        "Only for loading the page itself. Once the tool is open, processing happens on your device and your connection speed is irrelevant to how long the job takes.",
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Privacy and security angles
 * ------------------------------------------------------------------ */

const secure: VariationDefinition = {
  id: "secure",
  slugSuffix: "-secure",
  label: "Secure",
  localOnly: true,
  keyword: (t) => `secure ${lower(t)}`,
  h1: (t) => `Secure ${t.name}`,
  titlePrefix: (t) => `Secure ${t.name} — Files Never Leave Your Device`,
  description: (t) =>
    `${t.name} with your files staying on your device. No upload, nothing retained. ${t.blurb}`,
  lead: (t) => [
    `The most secure way to handle a confidential document is not to send it anywhere. This tool is built that way: your ${t.acceptLabel} file is read into the browser tab in front of you, processed there by your own device, and never transmitted.`,
    `That is a meaningfully different security model from "we encrypt uploads and delete files after an hour". Both are reasonable, but one requires you to trust a retention policy you cannot inspect, and the other removes the need to trust anything, because there is no server-side copy to protect in the first place.`,
    `You can verify this yourself. Open your browser's developer tools, switch to the network tab, and run the tool. You will see the page and its scripts load, and then nothing further — no request carrying your document to any server.`,
  ],
  section: () => ({
    heading: "How to verify the security claim yourself",
    paragraphs: [
      "Security claims are worth exactly as much as your ability to check them, so here is how to check this one. Press F12 to open developer tools, or right-click the page and choose Inspect. Select the Network tab and clear whatever is listed.",
      "Now add your file and run the tool. Watch the network tab throughout. You will see requests for the page's own JavaScript — including the PDF libraries, which are loaded on demand the first time you use a tool — and then nothing. No POST request, no upload, no transfer of your document. The processing happens entirely between your file and your device's memory.",
      "You can go further and disconnect from the network entirely once the page has loaded. Every tool on this site except PDF to Word will continue to work perfectly with no connection at all, which is only possible because nothing is being sent anywhere.",
      "The one deliberate exception is the PDF to Word converter, which needs server-side layout analysis. That tool says so plainly on its own page rather than being quietly grouped in with the rest.",
    ],
  }),
  benefits: () => [
    {
      title: "No upload at any point",
      body: "Your document is read from your device into browser memory and processed there. It is never transmitted to any server.",
    },
    {
      title: "Nothing is retained",
      body: "There is no server-side copy to store, so there is no retention window, no deletion job and no backup holding your file.",
    },
    {
      title: "Independently verifiable",
      body: "Open your browser's network inspector and watch. No request carrying your file will appear, because none is made.",
    },
  ],
  faqs: (t) => [
    {
      question: "Are my files uploaded to a server?",
      answer:
        "No. The file is read into your browser's memory and processed by your own device. You can confirm this in your browser's network inspector — no request carrying your document is made.",
    },
    {
      question: "How long are my files kept?",
      answer:
        "They are never stored anywhere to begin with. The file exists only in the memory of the browser tab, and it is released the moment you close the tab, reload the page, or press start over.",
    },
    {
      question: `Can I ${t.verb} a confidential document safely?`,
      answer:
        "The processing model is designed for exactly that: the document never leaves your device, so there is no transmission to intercept and no server-side copy to be breached. As always, follow your own organisation's policy on handling sensitive material.",
    },
  ],
};

const withoutUpload: VariationDefinition = {
  id: "without-upload",
  slugSuffix: "-without-upload",
  label: "Without upload",
  localOnly: true,
  keyword: (t) => `${lower(t)} without uploading`,
  h1: (t) => `${t.name} Without Uploading Anything`,
  titlePrefix: (t) => `${t.name} Without Upload — 100% On Your Device`,
  description: (t) =>
    `${t.name} with no upload at all. Your file is processed by your own browser and never sent to a server.`,
  lead: (t) => [
    `The word "upload" does a lot of quiet work on most online PDF sites. You choose a file, it goes to a server you know nothing about, something happens to it there, and a result comes back. This tool does not do that. Nothing is uploaded, at any point, for any reason.`,
    `What happens instead is that your browser reads the file directly from your disk into the memory of the tab you are looking at. The ${lower(t)} operation runs there, using your device's own processor, and the finished file is created in that same memory and offered to you as a download.`,
    `This is possible because modern browsers are genuinely capable environments. The File API can read local files, WebAssembly and modern JavaScript engines can do real document processing, and the download mechanism can hand back a file that was constructed entirely in the tab. Ten years ago this genuinely required a server. It no longer does.`,
  ],
  section: () => ({
    heading: "What happens to your file, step by step",
    paragraphs: [
      "When you drop a file onto the upload area, your browser gives the page a reference to it — not the contents, just a handle. Nothing has been read at that point, and certainly nothing sent.",
      "When you press the action button, the page reads the bytes of that file into memory using the browser's File API. This is a local disk read, the same kind any application on your device performs, and it never touches the network.",
      "The processing runs against those bytes inside the tab. Depending on the tool, that means parsing the PDF structure with pdf-lib or rendering pages with pdf.js — both are JavaScript libraries that were downloaded once as part of the page and run entirely on your processor.",
      "The result is assembled in memory as a Blob and given a temporary local address that only your browser knows about. Pressing download copies it from memory to your disk. At no stage in this sequence does your document, or any part of it, travel over the network.",
    ],
  }),
  benefits: () => [
    {
      title: "No transfer to intercept",
      body: "Because nothing is transmitted, there is no network traffic carrying your document that could be observed anywhere along the way.",
    },
    {
      title: "Works with no connection",
      body: "Once the page has loaded you can disconnect entirely and the tool keeps working, which is only possible because nothing is being sent.",
    },
    {
      title: "No data allowance used",
      body: "On a metered or mobile connection, processing a 50 MB document costs you nothing beyond loading the page itself.",
    },
  ],
  faqs: () => [
    {
      question: "If nothing is uploaded, where does the processing happen?",
      answer:
        "In the browser tab, on your own device's processor. The PDF libraries that do the work are downloaded once with the page — after that, they run locally against the file you selected.",
    },
    {
      question: "Can I use this offline?",
      answer:
        "Every tool here except PDF to Word will keep working if you disconnect after the page has loaded. That is a direct consequence of nothing being uploaded.",
    },
    {
      question: "How can I be sure nothing is being sent?",
      answer:
        "Open developer tools with F12, select the Network tab, and run the tool. You will see the page's own scripts load and then no further requests. You can also simply disconnect from the network and watch it keep working.",
    },
  ],
};

const browser: VariationDefinition = {
  id: "browser",
  slugSuffix: "-browser",
  label: "In your browser",
  keyword: (t) => `${lower(t)} in browser`,
  h1: (t) => `${t.name} in Your Browser`,
  titlePrefix: (t) => `${t.name} in Browser — No Install, No Plugin`,
  description: (t) =>
    `${t.name} entirely in your browser. No download, no extension, no admin rights. Works on any modern browser.`,
  lead: (t) => [
    `This runs in the browser you already have open. There is no application to download, no extension to add, no plugin to enable and no administrator password to type. That last point matters more than people expect — plenty of work laptops simply will not let you install anything.`,
    `The tool loads as part of this page. Add your ${t.acceptLabel} file and everything needed to ${t.verb} it is already there, running on your device's processor rather than on somebody's server.`,
    `Any current browser will do. Chrome, Firefox, Safari and Edge are all fully supported, as are the Chromium-based alternatives — Brave, Opera, Vivaldi and Arc — on Windows, macOS, Linux, ChromeOS, iOS and Android.`,
  ],
  section: () => ({
    heading: "Why a browser is enough for this",
    paragraphs: [
      "Browsers stopped being document viewers a long time ago. The File API lets a page read local files with your permission. Canvas and WebAssembly give it real rendering and computation. Blob URLs let it construct a file in memory and hand it back as a download. Together those are everything a PDF tool needs.",
      "The libraries doing the work are the same ones desktop and server tools rely on. pdf.js is the renderer built into Firefox, and it is what draws pages here. pdf-lib handles reading and writing PDF structure. Neither is a cut-down browser substitute — they are the real implementations, running locally.",
      "For locked-down machines this is often the deciding factor. A managed work laptop that blocks installers will still open a web page, so a browser-based tool is frequently the only route to getting the job done without raising an IT ticket.",
    ],
  }),
  benefits: () => [
    {
      title: "No admin rights needed",
      body: "Nothing is installed, so a managed or locked-down work machine will run this without any IT involvement.",
    },
    {
      title: "Every major browser",
      body: "Chrome, Firefox, Safari, Edge, Brave, Opera and Vivaldi are all supported on desktop and mobile.",
    },
    {
      title: "Nothing left behind",
      body: "Close the tab and nothing remains — no installed application, no background service, no cached files.",
    },
  ],
  faqs: () => [
    {
      question: "Do I need a browser extension or plugin?",
      answer:
        "No. Everything is part of the page itself. There is nothing to add to your browser and nothing to enable.",
    },
    {
      question: "Which browsers are supported?",
      answer:
        "Any current version of Chrome, Firefox, Safari, Edge, Brave, Opera or Vivaldi, on any operating system. Internet Explorer is not supported, and very old browser versions may fail on larger documents.",
    },
    {
      question: "Will this work on a locked-down work computer?",
      answer:
        "Usually, yes. Because nothing is installed, the tool works on machines where you cannot install software. The only thing that would block it is a network policy preventing you reaching the site at all.",
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Output quality angles
 * ------------------------------------------------------------------ */

const withoutLosingQuality: VariationDefinition = {
  id: "without-losing-quality",
  slugSuffix: "-without-losing-quality",
  label: "Without losing quality",
  keyword: (t) => `${lower(t)} without losing quality`,
  h1: (t) => `${t.name} Without Losing Quality`,
  titlePrefix: (t) => `${t.name} Without Losing Quality`,
  description: (t) =>
    `${t.name} while keeping your original quality. Pages are handled at the object level, not re-rendered or re-compressed.`,
  lead: () => [
    `Quality loss in PDF tools comes from one thing: re-rendering. If a tool converts your pages into pictures and rebuilds the document from those, text goes soft, fine lines pick up artefacts, and the file often gets bigger rather than smaller. This tool avoids that wherever the operation allows it.`,
    `Where possible, pages are copied between documents as structured objects. Text stays as text — selectable, searchable and sharp at any zoom level. Embedded fonts travel with the pages that use them. Vector graphics stay vector, so a diagram is just as crisp at 400 per cent as it is at 100.`,
    `Images inside your document keep their original encoding and resolution. They are not decoded and re-encoded, which means no generational JPEG loss — the softening that accumulates every time an image is saved again through a lossy format.`,
  ],
  section: () => ({
    heading: "Where quality is genuinely lost, and where it is not",
    paragraphs: [
      "Structural operations — merging, splitting, rotating, watermarking, signing and adding text — involve no quality loss at all. They read the document's objects, rearrange or add to them, and write them back. What comes out is what went in, with your change applied.",
      "Rendering operations are a different matter, and it would be dishonest to pretend otherwise. Converting to JPG or PNG produces pixels, so resolution is a choice you make rather than something preserved. Compressing at anything above the Lossless level deliberately re-renders pages, which is precisely how the size reduction is achieved.",
      "Word to PDF sits in between: the document is laid out and rendered visually, so the output is a faithful picture of your document rather than selectable text. Every one of these trade-offs is stated on the tool's own page rather than glossed over.",
      "The rule of thumb is straightforward. If an operation changes the structure of a document, quality is preserved completely. If it changes the pixels, there is a trade-off, and you are the one who chooses where it sits.",
    ],
  }),
  benefits: () => [
    {
      title: "Text stays text",
      body: "Structural operations keep text selectable and searchable, and sharp at every zoom level, because it is never converted into an image.",
    },
    {
      title: "No generational loss",
      body: "Images keep their original encoding rather than being decoded and re-compressed, so no softening accumulates.",
    },
    {
      title: "Vectors stay vector",
      body: "Diagrams, charts and line art keep their mathematical definition and stay crisp at any magnification.",
    },
  ],
  faqs: (t) => [
    {
      question: `Will my ${t.outputNoun} look worse than the original?`,
      answer:
        "For structural operations — merging, splitting, rotating, watermarking, signing and text editing — there is no quality change whatsoever. For operations that render pages, such as image conversion and non-lossless compression, quality is a setting you control, and the trade-off is explained on the tool's own page.",
    },
    {
      question: "Will the text still be selectable and searchable?",
      answer:
        "Yes, for every structural operation. Text is only lost when a tool deliberately renders pages to pixels, which is limited to image conversion, compression above the Lossless level, and Word to PDF.",
    },
    {
      question: "Do embedded fonts survive?",
      answer:
        "Yes. When pages are copied between documents, the fonts they depend on are copied with them, so the output renders identically on a device that does not have those fonts installed.",
    },
  ],
};

const noWatermark: VariationDefinition = {
  id: "no-watermark",
  slugSuffix: "-no-watermark",
  label: "No watermark",
  keyword: (t) => `${lower(t)} no watermark`,
  h1: (t) => `${t.name} With No Watermark`,
  titlePrefix: (t) => `${t.name} No Watermark — Clean Output`,
  description: (t) =>
    `${t.name} with no watermark, logo or branding added to your file. The output contains your content and nothing else.`,
  lead: (t) => [
    `Nothing is added to your file. No logo in the corner, no line of promotional text in the footer, no diagonal stamp across the page, and no metadata naming the tool that produced it. What you download is your ${t.outputNoun} and nothing more.`,
    `This needs saying because the pattern is so common. A site offers a free ${lower(t)}, hands back a file with branding across every page, and points you at a subscription to remove it. That is not a free tool — it is a demonstration with your document used as the canvas.`,
    `The output here is indistinguishable from one produced by professional desktop software. Send it to a client, submit it to a portal or file it as a record, and there is nothing in it that identifies where it came from.`,
  ],
  section: () => ({
    heading: "What is and is not added to your file",
    paragraphs: [
      "No visible marking is added anywhere. No logo, no footer, no header, no corner stamp and no page overlay. Every page contains exactly what it contained before, plus whatever change you asked for.",
      "No hidden marking is added either. The PDF's document information — producer, creator, title, keywords — is not populated with promotional content, and no custom metadata identifying this site is written into the file.",
      "The single exception is the Watermark tool, which adds a watermark because that is the entire point of it, using text you supply. Even there, the mark is yours: nothing is added beyond what you typed.",
      "If you are checking, open the finished file in any PDF reader and look at Document Properties. You will find the standard fields written by the underlying PDF library and nothing referencing PDFNova.",
    ],
  }),
  benefits: () => [
    {
      title: "No visible branding",
      body: "No logo, footer, header or page stamp is added anywhere in the document.",
    },
    {
      title: "No hidden metadata",
      body: "Document properties are not populated with promotional text, and no custom identifying fields are written.",
    },
    {
      title: "Ready to send as-is",
      body: "The output is suitable for clients, submissions and formal records without any cleanup step first.",
    },
  ],
  faqs: (t) => [
    {
      question: `Is there a watermark on the ${t.outputNoun}?`,
      answer:
        "No. Nothing is added to your file — no visible marking of any kind, and no hidden metadata identifying the tool.",
    },
    {
      question: "Do I need to pay to remove branding?",
      answer:
        "There is no branding to remove and no payment step anywhere. The free output is the only output, and it is clean.",
    },
    {
      question: "Can the recipient tell which tool I used?",
      answer:
        "Not from the file. The document properties contain the standard fields the underlying PDF library writes and no reference to this site.",
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Platform angles
 * ------------------------------------------------------------------ */

interface PlatformSpec {
  id: string;
  slugSuffix: string;
  label: string;
  /** How the platform is written in a sentence, e.g. "a Mac". */
  article: string;
  /** Name used in headings, e.g. "Mac". */
  display: string;
  keywordSuffix: string;
  nativeStory: string;
  browserStory: string;
  savingStory: string;
  extraFaq: FaqItem;
}

const PLATFORMS: PlatformSpec[] = [
  {
    id: "mac",
    slugSuffix: "-on-mac",
    label: "On Mac",
    article: "a Mac",
    display: "Mac",
    keywordSuffix: "on mac",
    nativeStory:
      "macOS does ship with Preview, which is better at PDFs than most operating systems' built-in viewers — it can reorder pages in the sidebar and export a selection. But it is awkward for anything beyond the basics, its behaviour has shifted between macOS releases, and it cannot compress to a target size or convert between document formats. The usual next step is Adobe Acrobat, which means a subscription for a job that takes thirty seconds.",
    browserStory:
      "This runs in Safari, Chrome, Firefox, Edge, Arc or Brave on macOS, and works identically on Apple Silicon and older Intel Macs. There is no .dmg to mount, no application to drag to your Applications folder, no Gatekeeper warning about an unidentified developer, and no login item quietly added to your system.",
    savingStory:
      "Finished files land in your Downloads folder, or wherever you have pointed your browser. In Safari you can also hold the download and choose Save As if you would rather file it directly. Everything happens on your Mac — nothing is sent to iCloud or anywhere else.",
    extraFaq: {
      question: "Do I need Adobe Acrobat or a Mac App Store app for this?",
      answer:
        "No. Everything runs in your browser, so there is nothing to buy, download or install. It works the same on Apple Silicon and Intel Macs, and on every version of macOS with a current browser.",
    },
  },
  {
    id: "windows",
    slugSuffix: "-on-windows",
    label: "On Windows",
    article: "a Windows PC",
    display: "Windows",
    keywordSuffix: "on windows",
    nativeStory:
      "Windows still has no built-in PDF editing at all. Edge will display a PDF and let you scribble on it, but it cannot merge, split, compress or convert. Everything else means installing third-party software, which on a work machine usually means an IT request, and on a personal machine means picking your way past installers bundled with browser toolbars and trial nags.",
    browserStory:
      "This runs in Edge, Chrome, Firefox, Brave or Opera on Windows 10 and Windows 11. There is no .exe or .msi, no User Account Control prompt, no administrator password and no entry added to Programs and Features. That makes it particularly useful on a managed work laptop where installing anything is simply not permitted.",
    savingStory:
      "Files save to your Downloads folder by default. If you would rather choose the location each time, turn on \"Ask where to save each file\" in your browser's download settings and you will get a normal Save As dialogue.",
    extraFaq: {
      question: "Will this work on a locked-down work PC?",
      answer:
        "Usually, yes. Because nothing is installed, there is no UAC prompt and no administrator password required, which is exactly the barrier that stops most PDF software on managed machines. The only thing that would block it is a network policy preventing access to the site.",
    },
  },
  {
    id: "linux",
    slugSuffix: "-on-linux",
    label: "On Linux",
    article: "Linux",
    display: "Linux",
    keywordSuffix: "on linux",
    nativeStory:
      "Linux has genuinely capable PDF tooling — qpdf, pdftk, Ghostscript and PDF Arranger between them cover most of what anyone needs. The catch is that it is fragmented and mostly command-line, the package names differ across distributions, and remembering the right Ghostscript invocation for a size target is not most people's idea of a good afternoon.",
    browserStory:
      "This runs in Firefox, Chromium, Chrome, Brave or Vivaldi on any distribution — Ubuntu, Fedora, Debian, Arch, Mint, openSUSE, Pop!_OS, whatever you run. There is no package to install, no repository to add, no dependency to resolve and no difference in behaviour between distributions.",
    savingStory:
      "Files save to ~/Downloads or wherever your browser is configured to put them, as a normal file owned by you with standard permissions. Nothing needs root, and nothing is written outside your home directory.",
    extraFaq: {
      question: "How does this compare with qpdf or Ghostscript?",
      answer:
        "Those tools are more powerful and scriptable, and for batch work across hundreds of files they are the right choice. This is for the one-off case where you would otherwise be searching for the correct flags. No installation, no distribution-specific packages, and the same behaviour everywhere.",
    },
  },
  {
    id: "iphone",
    slugSuffix: "-on-iphone",
    label: "On iPhone",
    article: "an iPhone",
    display: "iPhone",
    keywordSuffix: "on iphone",
    nativeStory:
      "iOS makes PDFs surprisingly hard. The Files app can view them and Quick Look can preview them, but neither can merge, split or compress. The App Store is full of PDF apps that want a weekly subscription for one operation, and several of them upload your documents to their own servers to do the work.",
    browserStory:
      "This runs in Safari on your iPhone, and in Chrome, Firefox or Edge for iOS as well. There is nothing to install from the App Store, no subscription and no permission prompts beyond choosing a file. Tapping the upload area opens the standard iOS picker, so you can take a file from Files, iCloud Drive, your Photos library or any connected storage provider.",
    savingStory:
      "Finished files go to Safari's Downloads, which by default is the Downloads folder in Files on your device. From there you can move them into iCloud Drive, attach them to an email, or share them with any app through the standard share sheet.",
    extraFaq: {
      question: "Where does the downloaded file go on an iPhone?",
      answer:
        "Into the Downloads folder in the Files app, which is Safari's default location. Tap the download indicator in Safari's toolbar to jump straight to it, then use the share sheet to move it wherever it needs to go.",
    },
  },
  {
    id: "android",
    slugSuffix: "-on-android",
    label: "On Android",
    article: "an Android phone",
    display: "Android",
    keywordSuffix: "on android",
    nativeStory:
      "Android has no built-in PDF editing. Google Drive will view a PDF, and some manufacturers add a basic viewer, but merging, splitting and compressing all mean an app from the Play Store. Most of those are advertising-supported, request more permissions than the job needs, and upload your documents to their own servers.",
    browserStory:
      "This runs in Chrome, Firefox, Samsung Internet, Edge or Brave on Android. There is no app to install, no storage permission to grant beyond picking a file, and no advertising. Tapping the upload area opens the standard Android file picker, so you can pull a document from local storage, Google Drive, or any other provider you have connected.",
    savingStory:
      "Files save to your device's Downloads folder, where the Files app, Files by Google and any other file manager will find them. From there the standard Android share menu will send them to email, messaging or cloud storage.",
    extraFaq: {
      question: "Do I need to install an app from the Play Store?",
      answer:
        "No. Everything runs in your mobile browser. That also means no advertising, no permission requests beyond choosing a file, and no app sitting on your phone afterwards.",
    },
  },
  {
    id: "chromebook",
    slugSuffix: "-on-chromebook",
    label: "On Chromebook",
    article: "a Chromebook",
    display: "Chromebook",
    keywordSuffix: "on chromebook",
    nativeStory:
      "ChromeOS is built around the browser, which normally makes PDF work frustrating — most desktop PDF software simply does not exist for it. The workarounds are Android apps with awkward file access, Linux containers that need enabling first, or web tools that upload everything you touch.",
    browserStory:
      "A browser-based tool is the natural fit for a Chromebook: this is exactly the environment it was designed for. It runs in Chrome on ChromeOS with no Android app, no Linux container and no developer mode. On school and workplace Chromebooks with locked-down policies, it works without any of the permissions those restrictions normally block.",
    savingStory:
      "Files save into the Downloads folder in the ChromeOS Files app. From there you can move them to Google Drive, an attached USB drive or an SD card in the usual way.",
    extraFaq: {
      question: "Does this work on a school or work-managed Chromebook?",
      answer:
        "Generally yes. Nothing is installed and no special permissions are needed, so the restrictions that block Android apps and Linux containers do not apply. Only a network policy blocking the site itself would stop it.",
    },
  },
];

function platformVariation(spec: PlatformSpec): VariationDefinition {
  return {
    id: spec.id,
    slugSuffix: spec.slugSuffix,
    label: spec.label,
    keyword: (t) => `${lower(t)} ${spec.keywordSuffix}`,
    h1: (t) => `${t.name} on ${spec.display}`,
    titlePrefix: (t) => `${t.name} on ${spec.display} — Free, No Install`,
    description: (t) =>
      `${t.name} on ${spec.display} with nothing to install. ${t.blurb} Works in your browser, free.`,
    lead: (t) => [
      `If you are on ${spec.article} and need to ${t.verb} a ${t.acceptLabel} file, this page is the whole solution. Nothing to install, nothing to buy, and no account — add your file and the tool is ready.`,
      spec.nativeStory,
      spec.browserStory,
    ],
    section: (t) => ({
      heading: `Using the ${lower(t)} tool on ${spec.display}`,
      paragraphs: [
        spec.savingStory,
        `The tool itself behaves identically regardless of what you are running it on. The same options, the same validation, the same progress reporting and the same output — a file produced on ${spec.article} is byte-for-byte equivalent to one produced anywhere else, because the same code does the work in both cases.`,
        `That consistency is worth something practical. Start a job on ${spec.article} and finish it on a different device, or hand the page to a colleague on another platform, and neither of you has to learn a different interface or account for a difference in behaviour.`,
      ],
    }),
    benefits: (t) => [
      {
        title: `No ${spec.display} software to install`,
        body: `No application, no package and no app store download. The ${lower(t)} tool runs in the browser already on your ${spec.display} device.`,
      },
      {
        title: "Identical output everywhere",
        body: `The same code runs on every platform, so a file produced on ${spec.article} is identical to one produced anywhere else.`,
      },
      {
        title: "Standard download handling",
        body: `Finished files go to your usual downloads location and behave like any other file on ${spec.display}.`,
      },
    ],
    faqs: (t) => [
      spec.extraFaq,
      {
        question: `Is the ${lower(t)} tool different on ${spec.display}?`,
        answer:
          "No. It is the same tool with the same options and the same processing code. Only the browser and the download location differ.",
      },
    ],
  };
}

/* ------------------------------------------------------------------ *
 * Device-class angles
 * ------------------------------------------------------------------ */

const mobile: VariationDefinition = {
  id: "mobile",
  slugSuffix: "-mobile",
  label: "On mobile",
  keyword: (t) => `${lower(t)} on mobile`,
  h1: (t) => `${t.name} on Mobile`,
  titlePrefix: (t) => `${t.name} on Mobile — Phone and Tablet`,
  description: (t) =>
    `${t.name} on your phone or tablet with no app to install. ${t.blurb} Works in any mobile browser.`,
  lead: () => [
    `Documents arrive on phones now. An attachment comes in, it needs handling, and you are nowhere near a computer. This page works properly on a phone or tablet — not a cut-down version of the tool, but the same one with the same options.`,
    `There is no app to install. That avoids the usual mobile PDF experience, where a Play Store or App Store search returns a wall of advertising-supported apps that want broad storage permissions and quietly upload your documents to process them.`,
    `Tapping the upload area opens your device's standard file picker, so you can pull a document from local storage, iCloud Drive, Google Drive or any other provider you have connected. Everything after that happens on the phone itself.`,
  ],
  section: () => ({
    heading: "What to know about running this on a phone",
    paragraphs: [
      "The interface adapts to a small screen: controls are laid out in a single column, buttons are sized for a fingertip rather than a cursor, and no horizontal scrolling is required at any point.",
      "Because processing happens on the device, nothing is charged against your mobile data allowance beyond loading the page. Handling a 40 MB scanned document on a metered connection costs you nothing extra, which is not true of tools that upload.",
      "Phones have less memory to spare than laptops, so very large documents are the one place you may hit a limit. If a big job fails, close other browser tabs and try again — that usually resolves it. Operations that re-render every page, such as compression and image conversion, are also noticeably slower on a phone than on a computer, though progress is reported throughout so you always know it is working.",
      "One practical tip: keep the tab in the foreground while a long job runs. Mobile browsers aggressively suspend background tabs to save battery, which can stall processing until you return to it.",
    ],
  }),
  benefits: () => [
    {
      title: "No app required",
      body: "Works in your mobile browser with nothing to install, no permissions to grant and no advertising.",
    },
    {
      title: "No data allowance used",
      body: "Files are processed on the device, so nothing is uploaded and nothing counts against a metered connection.",
    },
    {
      title: "Touch-friendly layout",
      body: "Single-column layout with fingertip-sized controls and no horizontal scrolling on small screens.",
    },
  ],
  faqs: () => [
    {
      question: "Does this work on both iPhone and Android?",
      answer:
        "Yes. Safari and Chrome on iOS, and Chrome, Firefox, Samsung Internet or Edge on Android. The tool and its output are identical on both.",
    },
    {
      question: "Where do files go after I download them on a phone?",
      answer:
        "On iOS, into the Downloads folder in the Files app. On Android, into your device's Downloads folder where any file manager will find it. From there the normal share sheet sends them anywhere you need.",
    },
    {
      question: "Will a large document work on a phone?",
      answer:
        "Usually. Phones have less spare memory than laptops, so very large files are where you may hit a limit. Closing other tabs first helps, and splitting a very long document into sections is a reliable fallback.",
    },
  ],
};

const desktop: VariationDefinition = {
  id: "desktop",
  slugSuffix: "-desktop",
  label: "On desktop",
  keyword: (t) => `${lower(t)} on desktop`,
  h1: (t) => `${t.name} on Desktop`,
  titlePrefix: (t) => `${t.name} on Desktop — No Software to Install`,
  description: (t) =>
    `${t.name} on desktop without installing software. ${t.blurb} Full keyboard support and drag and drop.`,
  lead: () => [
    `A desktop or laptop is the best place to run this. More memory means larger documents, a faster processor means quicker work on operations that re-render pages, and drag and drop from a file manager makes adding files immediate.`,
    `None of that requires installing anything. The tool runs in whichever browser you already use, so there is no software to download, no licence tied to this particular machine and nothing to reinstall the next time you change computers.`,
    `Drag files straight from Finder, File Explorer or your Linux file manager onto the upload area. Or use the keyboard throughout — every control is reachable with Tab and operable with Enter or Space, including the upload area itself.`,
  ],
  section: (t) => ({
    heading: "Getting the most out of it on a computer",
    paragraphs: [
      "Drag and drop is the fastest way to add files. Select several in your file manager and drop them onto the upload area together — they are added in one go, and for tools that accept multiple files you can drop more on afterwards to append to the list.",
      "The whole interface is keyboard-navigable. Tab moves between controls in a sensible order, the upload area responds to Enter and Space, and focus outlines are always visible so you can see where you are. Nothing requires a mouse.",
      `A desktop's memory headroom is the real advantage. Files up to ${t.maxFileSizeMB} MB${t.multiple ? ` and up to ${t.maxFiles} of them at once` : ""} are comfortable on a machine with a few gigabytes free, where a phone would struggle. Operations that re-render pages also finish several times faster on a desktop processor.`,
    ],
  }),
  benefits: () => [
    {
      title: "Drag and drop from your file manager",
      body: "Drop files straight from Finder, File Explorer or any Linux file manager, several at a time.",
    },
    {
      title: "Full keyboard navigation",
      body: "Every control is reachable with Tab and operable from the keyboard, with visible focus throughout.",
    },
    {
      title: "Room for larger documents",
      body: "Desktop memory headroom handles big files comfortably, and page-rendering operations finish considerably faster.",
    },
  ],
  faqs: () => [
    {
      question: "Can I drag files in from my file manager?",
      answer:
        "Yes. Drag one or several files onto the upload area from Finder, File Explorer or any Linux file manager. For tools that take multiple files, dropping more later appends them to the list.",
    },
    {
      question: "Can I use this entirely from the keyboard?",
      answer:
        "Yes. Tab moves through every control in order, the upload area opens the file picker with Enter or Space, and all buttons and form fields are keyboard-operable with visible focus indicators.",
    },
    {
      question: "Is a desktop faster than a phone for this?",
      answer:
        "For operations that re-render pages — compression and image conversion — considerably so, often several times. Structural operations like merging and rotating are fast enough everywhere that the difference is hard to notice.",
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Tool-specific angles
 * ------------------------------------------------------------------ */

function compressTarget(kb: number, label: string, slug: string): VariationDefinition {
  const isMb = kb >= 1024;
  const display = isMb ? `${kb / 1024} MB` : `${kb} KB`;
  return {
    id: `under-${slug}`,
    slugSuffix: `-under-${slug}`,
    label: `Under ${display}`,
    onlyTools: ["compress-pdf"],
    keyword: () => `compress pdf under ${label}`,
    h1: () => `Compress PDF to Under ${display}`,
    titlePrefix: () => `Compress PDF Under ${display} — Free Online`,
    description: () =>
      `Compress a PDF to under ${display} online free. The tool tries stronger settings until your file fits, then reports the result.`,
    lead: () => [
      `Upload limits are the reason most people compress a PDF, and ${display} is one of the common ones. This page opens the compressor with a ${display} target already in mind: choose the Target size level, set the value to ${kb} KB, and it will keep trying until the file fits or it runs out of settings that still leave the document readable.`,
      `The tool does not compress once and hope. It works through six progressively stronger combinations of render resolution and image quality, checking the size after each one, and stops at the first that meets your number. That is the difference between a tool that gets you to ${display} and one that gets you to "smaller, probably".`,
      `If your document genuinely cannot reach ${display} without becoming unreadable, you are told so directly and given the smallest usable version instead. That is more useful than an illegible file that happens to hit the number.`,
    ],
    section: () => ({
      heading: `Getting a PDF under ${display} in practice`,
      paragraphs: [
        `Select Target size as the compression level and enter ${kb} in the target field. The tool first tries a structural rewrite — if your document has a lot of internal bloat, that alone can be enough, and it will stop there without touching a single page.`,
        `If that does not reach ${display}, it starts re-rendering. The first pass renders pages at 1.5x with 82 per cent JPEG quality, which usually still looks excellent. Each subsequent pass drops both the resolution and the quality, down to a final attempt at 0.55x and 34 per cent. The moment a pass comes in at or under ${kb} KB, that version is what you get.`,
        `How achievable ${display} is depends entirely on the document. A scanned twenty-page contract is mostly image data and compresses dramatically — reaching ${display} is usually straightforward. A two-hundred-page text document has a floor set by the amount of text it contains, and no amount of image compression moves it. Preview the result before downloading; if it is too soft to read, use a larger target or split the document and compress the sections separately.`,
      ],
    }),
    benefits: () => [
      {
        title: `Keeps trying until it fits`,
        body: `Six progressively stronger passes are attempted, stopping at the first that comes in at or under ${display}.`,
      },
      {
        title: "Stops as soon as it can",
        body: `The first pass that reaches ${display} is what you get, so you are never given a file compressed harder than necessary.`,
      },
      {
        title: "Honest when it cannot",
        body: `If ${display} is not reachable without destroying legibility, you are told directly and given the smallest usable version.`,
      },
    ],
    faqs: () => [
      {
        question: `Can any PDF be compressed to under ${display}?`,
        answer: `No, and it would be misleading to claim otherwise. Scanned and image-heavy documents usually can, often easily. A long text-only document has a size floor set by its actual content. The tool tells you plainly when it could not reach the target rather than pretending it did.`,
      },
      {
        question: `Will the document still be readable at ${display}?`,
        answer:
          "Usually yes, but check the preview before you download. The tool stops at the first pass that meets your target, so it never compresses harder than it needs to. If the result is too soft, try a slightly larger target.",
      },
      {
        question: "What should I do if the target cannot be reached?",
        answer:
          "Split the document and compress the sections separately, then send them as multiple files — this is usually the best route for long documents. Alternatively, raise the target slightly; the difference between 1 MB and 1.5 MB is often the difference between soft and sharp.",
      },
    ],
  };
}

const compressLossless: VariationDefinition = {
  id: "lossless",
  slugSuffix: "-lossless",
  label: "Lossless",
  onlyTools: ["compress-pdf"],
  keyword: () => "lossless pdf compression",
  h1: () => "Lossless PDF Compression",
  titlePrefix: () => "Lossless PDF Compression — No Quality Loss",
  description: () =>
    "Compress a PDF without any quality loss. Structure is optimised, page content is left completely untouched, and text stays selectable.",
  lead: () => [
    "Lossless compression means exactly what it says: not one pixel of your page content changes. Text stays selectable and searchable, images keep their original resolution and encoding, and vector graphics remain vector. The saving comes from how the file is organised internally, not from what it contains.",
    "This is the right choice when the document has to stay intact. Contracts you may need to search, reports where the text must remain copyable, and anything going into a records system that expects real text rather than pictures of text.",
    "It is also the honest choice about expectations. Lossless compression on a well-built PDF may save very little, because there was not much structural waste to remove. When that happens the tool says so rather than handing you a file that is 1 per cent smaller and calling it a success.",
  ],
  section: () => ({
    heading: "What lossless compression actually removes",
    paragraphs: [
      "A PDF is a collection of numbered objects with a cross-reference table pointing at them. Documents assembled by exporters, or edited repeatedly, accumulate structural overhead: objects stored individually where they could be packed together, and cross-reference tables written in a verbose format.",
      "Lossless compression rewrites that structure using cross-reference streams and object streams, which pack many small objects into single compressed blocks. Page content — the text, the images, the vector instructions — is copied across byte for byte and never touched.",
      "How much this saves depends entirely on how the original was produced. Documents from certain exporters, or files that have been edited and re-saved many times, can shrink noticeably. A cleanly generated PDF may barely move, because there was nothing wasteful to reclaim.",
      "If lossless does not save enough for your purposes, the Balanced, Strong and Target size levels are available on the same page. Those do re-render pages, which is a real trade-off — text becomes part of the image and is no longer selectable — but it is where the large savings live.",
    ],
  }),
  benefits: () => [
    {
      title: "Text stays selectable",
      body: "Page content is untouched, so text remains searchable, copyable and sharp at any zoom level.",
    },
    {
      title: "Images keep their resolution",
      body: "Embedded images are copied in their original encoding — nothing is decoded, resampled or re-compressed.",
    },
    {
      title: "Safe for records",
      body: "The document remains a faithful copy of the original, suitable for archives and systems that expect real text.",
    },
  ],
  faqs: () => [
    {
      question: "How much smaller will lossless compression make my PDF?",
      answer:
        "It varies enormously — anywhere from a few per cent to a third, depending on how much structural overhead the file carries. Documents that have been edited and re-saved repeatedly tend to benefit most. Cleanly generated files may barely change, and the tool will tell you when that is the case.",
    },
    {
      question: "Is anything at all lost?",
      answer:
        "No page content. Text, images, fonts and vector graphics are all preserved exactly. Only the file's internal structure is reorganised.",
    },
    {
      question: "When should I use a stronger level instead?",
      answer:
        "When you need a large reduction and the document is image-heavy — a scanned document, for instance, where searchable text was never there to lose. Be aware that any level above Lossless converts pages into images, which removes text selection permanently.",
    },
  ],
};

const extractPages: VariationDefinition = {
  id: "extract-pages",
  slugSuffix: "-extract-pages",
  label: "Extract pages",
  onlyTools: ["split-pdf"],
  keyword: () => "extract pages from pdf",
  h1: () => "Extract Pages From a PDF",
  titlePrefix: () => "Extract Pages From PDF — Free, Online",
  description: () =>
    "Pull specific pages out of a PDF into a new document. Enter a range like 1-3, 7, 9-12 and download just those pages.",
  lead: () => [
    "Extracting pages is the opposite of splitting a document into all its pieces. You know which pages you want — the signature page, one chapter, the three pages a colleague actually needs — and everything else is noise.",
    "Choose the extract mode, write the pages the way you would say them out loud, and you get a single new PDF containing exactly those pages in exactly that order. The document you started with is untouched.",
    "Ranges are validated against the real page count before anything runs, so asking for page 40 of a 30-page document tells you so immediately rather than failing part-way through.",
  ],
  section: () => ({
    heading: "Writing the page range",
    paragraphs: [
      "Use commas to separate entries and hyphens inside a range. 1-3, 7, 9-12 gives you pages one, two, three, seven, nine, ten, eleven and twelve — eight pages in one new document. Spaces are ignored, so write it however reads most naturally.",
      "Pages come out in the order you list them, which means the range is also a reordering tool. Entering 5, 1-2 produces a document with the original page five first, followed by pages one and two. A page listed more than once appears only once, at its first position.",
      "Page numbers start at 1 and refer to the physical pages of the PDF, which is not always the number printed on the page. A document with a cover and two front-matter pages will have its printed page 1 as physical page 4 — check in your reader if you are unsure.",
    ],
  }),
  benefits: () => [
    {
      title: "Any combination of pages",
      body: "Mix individual pages and ranges freely in one expression — 1-3, 7, 9-12 works exactly as written.",
    },
    {
      title: "Order is preserved as written",
      body: "Pages appear in the order you listed them, so the range doubles as a simple reordering tool.",
    },
    {
      title: "Validated before it runs",
      body: "An impossible page number is reported immediately with the document's real page count, before any processing begins.",
    },
  ],
  faqs: () => [
    {
      question: "How do I extract a single page?",
      answer:
        "Choose the extract mode and enter just that number — 7, for example. You get a one-page PDF containing that page.",
    },
    {
      question: "Can I extract pages in a different order?",
      answer:
        "Yes. Pages appear in the order you list them, so entering 5, 1-2 puts page five first. It is a simple way to reorder while extracting.",
    },
    {
      question: "Do page numbers match what is printed on the page?",
      answer:
        "Not necessarily. Page numbers here are physical positions in the file, starting at 1. If your document has a cover or front matter, the printed numbers will be offset. Check the page counter in your PDF reader if you are unsure.",
    },
  ],
};

const rotatePermanently: VariationDefinition = {
  id: "permanently",
  slugSuffix: "-permanently",
  label: "Permanently",
  onlyTools: ["rotate-pdf"],
  keyword: () => "rotate pdf permanently",
  h1: () => "Rotate a PDF Permanently",
  titlePrefix: () => "Rotate PDF Permanently and Save",
  description: () =>
    "Rotate PDF pages permanently so the change is saved into the file. Unlike rotating in a viewer, the fix travels with the document.",
  lead: () => [
    "Almost everyone hits this at some point: you rotate a sideways PDF in your reader, close it, open it again, and it is sideways once more. That is not a bug. Most viewers treat rotation as a temporary display setting that is never written back to the file.",
    "This tool writes the rotation into the document itself. The angle is stored as a page attribute in the PDF, which every compliant reader honours, so the file opens correctly for you, for the person you email it to, and for the printer.",
    "It is the difference between changing how a document looks to you right now and changing what the document is. Once saved here, the orientation travels with the file wherever it goes.",
  ],
  section: () => ({
    heading: "Why rotating in your reader does not stick",
    paragraphs: [
      "Every page in a PDF carries a rotation value — 0, 90, 180 or 270 — that tells readers how to turn it before display. When you press rotate in most viewers, the application changes its own view state and leaves that stored value alone, which is why reopening the file undoes it.",
      "Some readers do offer a genuine save. Adobe Acrobat can rotate and save, and macOS Preview writes rotation back when you save the document. But the behaviour is inconsistent between applications and versions, and it is rarely obvious which kind of rotation you just performed.",
      "This tool only does the permanent kind. It reads each target page's existing rotation value, adds your chosen angle, and writes the result back into the file. There is no view state involved and no ambiguity about whether it saved.",
      "One useful consequence: because the angle is added to whatever was already there, a mixed batch of pages at different rotations can be corrected page by page without any of them snapping back to zero.",
    ],
  }),
  benefits: () => [
    {
      title: "Written into the file",
      body: "The rotation is stored as a page attribute in the PDF, not as a viewer preference, so it survives being closed, copied and emailed.",
    },
    {
      title: "Correct for every recipient",
      body: "Anyone who opens the file sees it the right way up, in any compliant reader, on any platform.",
    },
    {
      title: "Prints correctly too",
      body: "Print drivers read the stored page rotation, so the document comes out of the printer correctly oriented.",
    },
  ],
  faqs: () => [
    {
      question: "Why does my PDF go back to being sideways when I reopen it?",
      answer:
        "Because your viewer rotated the display, not the file. Most readers treat rotation as a temporary view setting and never write it back. Rotating here changes the document itself, so the fix persists.",
    },
    {
      question: "Will the person I send it to see it the right way up?",
      answer:
        "Yes. The rotation is stored in the PDF's page attributes, which every compliant reader honours regardless of platform or application.",
    },
    {
      question: "Does permanent rotation reduce quality?",
      answer:
        "No. Only a numeric attribute on each page changes. No content is re-rendered or re-encoded, and the file size is essentially identical.",
    },
  ],
};

const highResolution: VariationDefinition = {
  id: "high-resolution",
  slugSuffix: "-high-resolution",
  label: "High resolution",
  onlyTools: ["pdf-to-jpg", "pdf-to-image"],
  keyword: (t) => `${lower(t)} high resolution`,
  h1: (t) => `${t.name} in High Resolution`,
  titlePrefix: (t) => `${t.name} High Resolution — Up to 288 DPI`,
  description: (t) =>
    `${t.name} at print resolution. Choose up to 288 dpi for images that stay sharp when enlarged or printed.`,
  lead: () => [
    `Resolution is the single setting that decides whether your images are usable. Convert at screen resolution and they look fine in a browser but fall apart the moment anyone zooms in or prints them. This page starts from the assumption that you need the sharp version.`,
    `Three levels are available. Screen at 72 dpi matches the PDF's own native resolution and keeps files small. High at 144 dpi is the sensible default and looks crisp on modern high-density displays. Print at 288 dpi is four times the pixel count of screen resolution and holds up under enlargement.`,
    `An A4 page rendered at 288 dpi comes out around 2480 by 3508 pixels. That is a large image and a correspondingly large file, which is exactly what you want when it is going to be printed, cropped into or projected.`,
  ],
  section: (t) => ({
    heading: "Choosing the right resolution",
    paragraphs: [
      "The scale setting is a multiplier on the PDF's native 72 dpi. A scale of 1 renders an A4 page at roughly 595 by 842 pixels — fine for a thumbnail, soft for anything else. A scale of 2 gives about 1240 by 1754, which is the right default for viewing on a modern screen. A scale of 4 gives about 2480 by 3508, which is genuine print territory.",
      "Higher is not automatically better. Each step up quadruples the pixel count, so a 288 dpi conversion of a fifty-page document produces a great deal of data and takes noticeably longer to render. If the images are going into a web page or a chat message, 144 dpi is almost always the right answer.",
      "For printing, 288 dpi is the one to choose. Print output is typically 300 dpi, so anything rendered below that will show softness on paper that was invisible on screen. The same applies to images that will be cropped into, since cropping throws away pixels you cannot get back.",
      `${t.id === "pdf-to-jpg" ? "At high resolutions, also consider raising the JPEG quality setting. Compression artefacts that are invisible at screen size become obvious once an image is enlarged, and quality above 0.95 keeps text edges clean." : "PNG output is lossless, so high resolution and clean edges combine well — there are no compression artefacts to become visible under enlargement."}`,
    ],
  }),
  benefits: () => [
    {
      title: "Up to 288 dpi",
      body: "Four times the linear resolution of screen rendering, producing around 2480 by 3508 pixels for an A4 page.",
    },
    {
      title: "Holds up when enlarged",
      body: "Sharp enough to print, crop into or project without the softness that low-resolution conversion produces.",
    },
    {
      title: "You choose the trade-off",
      body: "Three resolution levels let you balance sharpness against file size and rendering time for each job.",
    },
  ],
  faqs: () => [
    {
      question: "What is the highest resolution available?",
      answer:
        "288 dpi, which is a 4x scale on the PDF's native 72 dpi. An A4 page comes out at roughly 2480 by 3508 pixels.",
    },
    {
      question: "Which resolution do I need for printing?",
      answer:
        "Choose Print at 288 dpi. Printers typically output at 300 dpi, so anything rendered lower will look soft on paper even if it looked fine on screen.",
    },
    {
      question: "Why is high-resolution conversion slower?",
      answer:
        "Each step up quadruples the number of pixels being rendered and encoded. A 288 dpi conversion does roughly sixteen times the work of a 72 dpi one, so a long document takes noticeably longer.",
    },
  ],
};

const multipleFiles: VariationDefinition = {
  id: "multiple-files",
  slugSuffix: "-multiple-files",
  label: "Multiple files",
  onlyTools: ["merge-pdf", "jpg-to-pdf"],
  keyword: (t) => `${lower(t)} multiple files`,
  h1: (t) => `${t.name} — Multiple Files at Once`,
  titlePrefix: (t) => `${t.name} Multiple Files at Once — Free`,
  description: (t) =>
    `${t.name} with up to ${t.maxFiles} files in a single pass. Add them all, arrange the order, and produce one document.`,
  lead: (t) => [
    `You are not limited to two files. Add up to ${t.maxFiles} in a single run, in as many separate selections as you like — each new batch is appended to the list rather than replacing what is already there.`,
    `That last detail matters in practice. Files rarely live in one folder. Grab three from your desktop, four from a downloads folder and two more from somewhere else, and they all accumulate in the same ordered list.`,
    `Once they are all in, arrange them. Every file has up and down controls, and the number beside it is the position it will occupy in the finished document. Remove anything added by mistake without starting over.`,
  ],
  section: (t) => ({
    heading: `Working with a large set of files`,
    paragraphs: [
      `The order shown on screen is the order used. Operating systems sort files in ways that rarely match what you intended — "file10" often lands before "file2" — so always check the list rather than trusting the order they arrived in.`,
      `Each file can be up to ${t.maxFileSizeMB} MB, and the ${t.maxFiles}-file limit is about what a browser tab can hold comfortably rather than a commercial restriction. If you need more, process in batches and then combine the results; the outcome is identical.`,
      `For very large sets, working in groups is more reliable than pushing a single run to the limit. Twenty files in two batches of ten will complete comfortably on hardware where one batch of twenty might strain memory, and nothing about the final document differs.`,
    ],
  }),
  benefits: (t) => [
    {
      title: `Up to ${t.maxFiles} files`,
      body: `Process as many as ${t.maxFiles} in a single run, each up to ${t.maxFileSizeMB} MB.`,
    },
    {
      title: "Add in several goes",
      body: "New selections are appended to the list rather than replacing it, so files can come from anywhere on your device.",
    },
    {
      title: "Full control of the order",
      body: "Move any file up or down until the sequence is right, and remove anything added by mistake.",
    },
  ],
  faqs: (t) => [
    {
      question: `How many files can I process at once?`,
      answer: `Up to ${t.maxFiles} in a single run, each up to ${t.maxFileSizeMB} MB. For larger sets, work in batches — the result is exactly the same.`,
    },
    {
      question: "Can I add files from different folders?",
      answer:
        "Yes. Each selection is appended to the existing list, so you can pull files from as many locations as you need before running the tool.",
    },
    {
      question: "How is the order decided?",
      answer:
        "By the order shown on screen, which you control. Do not rely on the order your file picker returned — operating systems sort names in ways that often put file10 before file2.",
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Catalogue
 * ------------------------------------------------------------------ */

/**
 * Every variation. Add an entry here — or widen an existing `onlyTools` —
 * and the routes, metadata, schema and sitemap follow automatically.
 */
export const VARIATIONS: VariationDefinition[] = [
  online,
  free,
  withoutSignup,
  unlimited,
  fast,
  secure,
  withoutUpload,
  browser,
  withoutLosingQuality,
  noWatermark,
  ...PLATFORMS.map(platformVariation),
  mobile,
  desktop,
  compressTarget(100, "100kb", "100kb"),
  compressTarget(500, "500kb", "500kb"),
  compressTarget(1024, "1mb", "1mb"),
  compressTarget(2048, "2mb", "2mb"),
  compressTarget(5120, "5mb", "5mb"),
  compressLossless,
  extractPages,
  rotatePermanently,
  highResolution,
  multipleFiles,
];

export function getVariation(id: string): VariationDefinition | undefined {
  return VARIATIONS.find((variation) => variation.id === id);
}

/** True when this variation may be generated for this tool. */
export function variationAppliesTo(
  variation: VariationDefinition,
  tool: ToolDefinition
): boolean {
  if (variation.onlyTools && !variation.onlyTools.includes(tool.id)) return false;
  // Never claim on-device processing for a tool that posts to a server.
  if (variation.localOnly && tool.processingType !== "client") return false;
  return tool.available;
}
