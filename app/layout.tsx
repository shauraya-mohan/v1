import type { Metadata, Viewport } from "next";
import { Newsreader, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shauraya Mohan",
  description:
    "AI engineer, computer science at Waterloo. Agents allowed to touch production — at Windscribe and Control D.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F4ED" },
    { media: "(prefers-color-scheme: dark)", color: "#242321" },
  ],
};

// Apply the stored theme before first paint so the page never flashes the wrong scheme.
const THEME_BOOTSTRAP = `try{var t=localStorage.getItem("sm-portfolio-theme");if(t==="light"||t==="dark"){document.documentElement.style.colorScheme=t;document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The bootstrap below sets color-scheme on <html> before React hydrates, so
    // the server markup (no style attribute) can't match. Suppressing here is
    // scoped to this element's own attributes, not the tree beneath it.
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable}`}
      style={{ colorScheme: "dark" }}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
