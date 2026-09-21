export type ProjectCategory = "Full Stack" | "Mobile" | "Frontend";

export type ProjectStatus =
  | "Live"
  | "Live · Active Development"
  | "Preview"
  | "Testing"
  | "In Development"
  | "Completed";

export type Project = {
  slug: string;
  title: string;
  eyebrow: string;
  year: string;
  period: string;
  role: string;
  status: ProjectStatus;
  category: ProjectCategory[];
  featured: boolean;
  summary: string;
  description: string[];
  tech: string[];
  highlights: string[];
  visual: string;
  gallery: string[];
  code?: string;
  codeLabel?: string;

  preview?: string;
  previewLabel?: string;
};

export const projects: Project[] = [
  {
    slug: "splitverse-website",
    title: "SplitVerse Website",
    eyebrow: "Fair expense splitting, redesigned",
    year: "2026",
    period: "June 2026 — Present",
    role: "Creator · Product Designer · Full-Stack Developer",
    status: "Live · Active Development",
    category: ["Full Stack", "Frontend"],
    featured: true,
    summary:
      "A production-focused expense tracker and bill-splitting platform built around fair item-wise payments instead of equal-only splits.",
    description: [
      "SplitVerse helps friends, roommates and groups track shared spending, assign exact item amounts and settle balances clearly. The product was designed to handle realistic restaurant, travel and household expense scenarios where every person should pay only for what they used.",
      "The website combines a React and TypeScript interface with an Express and PostgreSQL backend. It includes split rooms, members, item assignments, adjusted settlements, wallet flows, transaction history, friend requests, notifications, profile settings and production integrations.",
      "The implementation also covers Firebase authentication, server-side Firebase verification, Razorpay payment verification, Cloudinary profile images, Brevo email delivery, Argon2 wallet PIN protection and Server-Sent Events for live updates.",
    ],
    tech: [
      "React",
      "TypeScript",
      "Vite",
      "CSS",
      "Node.js",
      "Express",
      "PostgreSQL",
      "Neon",
      "Firebase",
      "Razorpay",
      "Cloudinary",
      "Brevo",
      "SSE",
    ],
    highlights: [
      "Exact item-wise expense allocation",
      "Cross-room adjusted settlement logic",
      "Wallet, payment verification and transaction history",
      "Friends, invitations and live notifications",
    ],
    visual: "/project-visuals/splitverse-web-cover.webp",
    gallery: [
      "/project-visuals/splitverse-web-item-splitting.webp",
      "/project-visuals/splitverse-web-settlement.webp",
      "/project-visuals/splitverse-web-wallet.webp",
      "/project-visuals/splitverse-web-friends.webp",
    ],
    code: "https://github.com/sankhyapatra0808/Split_Verse",
    codeLabel: "View Web Code",
    preview: "https://split-verse.vercel.app",
    previewLabel: "Live Website",
  },
  {
    slug: "splitverse-mobile",
    title: "SplitVerse Mobile",
    eyebrow: "Shared expenses on Android",
    year: "2026",
    period: "July 2026 — Present",
    role: "Creator · Mobile Developer · API Integration",
    status: "Preview",
    category: ["Mobile", "Full Stack"],
    featured: false,
    summary:
      "A mobile client for the SplitVerse platform, designed for fast expense entry, room management, wallet access and clear settlements.",
    description: [
      "SplitVerse Mobile brings the same account and expense data into a focused Android experience. It connects to the existing SplitVerse backend so web and mobile users share rooms, balances, friends, transactions and account settings.",
      "The interface includes dashboard summaries, expense overlays, split rooms, friend management, wallet controls, transaction history, profile settings, notifications and authentication flows with OTP and Google sign-in.",
      "Particular attention was given to mobile keyboard behaviour, scrollable overlays, safe-area layout, loading states, dark-mode visibility and consistent error handling for offline, slow-network and server failures.",
    ],
    tech: [
      "React Native",
      "Expo",
      "TypeScript",
      "Expo Router",
      "Firebase Auth",
      "AsyncStorage",
      "Secure Store",
      "REST APIs",
      "SSE",
      "Razorpay",
    ],
    highlights: [
      "Shared backend and data model with the web platform",
      "Mobile-first rooms, wallet and friends workflows",
      "OTP and Google authentication flows",
      "Installable Android testing builds with EAS",
    ],
    visual: "/project-visuals/splitverse-mobile-cover.webp",

    gallery: [
      "/project-visuals/splitverse-mobile-auth.webp",
      "/project-visuals/splitverse-mobile-dashboard.webp",
      "/project-visuals/splitverse-mobile-room.webp",
      "/project-visuals/splitverse-mobile-wallet.webp",
      "/project-visuals/splitverse-mobile-friends.webp",
      "/project-visuals/splitverse-mobile-settings.webp",
    ],
    code: "https://github.com/sankhyapatra0808/SplitVerse_Mobile",
    codeLabel: "View Mobile Code",
    preview:
      "https://github.com/sankhyapatra0808/SplitVerse_Mobile/releases/latest/download/SplitVerse-v1.1.0.apk",
    previewLabel: "Download APK",
  },
  {
    slug: "devarena",
    title: "DevArena",
    eyebrow: "Build. Compete. Grow.",
    year: "2026",
    period: "2026 — Present",
    role: "Creator · Frontend and Firebase Developer",
    status: "In Development",
    category: ["Frontend", "Full Stack"],
    featured: false,
    summary:
      "A developer-growth platform combining progress tracking, competitive rankings, challenges and portfolio-style profiles.",
    description: [
      "DevArena was created as a developer-centric platform rather than a generic admin dashboard. Its visual direction combines the clarity of modern developer tools with a premium dark interface, responsive navigation and carefully structured activity data.",
      "The application supports Firebase authentication, Firestore user profiles, activity logs, contribution-style heatmaps, XP, levels, streaks, Arena Score, contest ratings, leaderboards, badges, daily challenges and project profiles.",
      "Desktop screens use a more immersive information-rich layout, while mobile flows prioritise fast navigation and thumb-friendly controls.",
    ],
    tech: [
      "React",
      "TypeScript",
      "Vite",
      "CSS",
      "Firebase Auth",
      "Firestore",
      "React Router",
    ],
    highlights: [
      "Developer profiles with XP, levels, ranks and badges",
      "Activity heatmap and streak tracking",
      "Leaderboard and daily challenge experience",
      "Responsive premium dark dashboard",
    ],
    visual: "/project-visuals/devarena.svg",
    gallery: [
      "/project-visuals/devarena.svg",
      "/project-visuals/devarena-detail.svg",
    ],
    code: "https://github.com/sankhyapatra0808/Dev_Arena",
    codeLabel: "View Web Code",
    preview: "https://devarena-six.vercel.app",
    previewLabel: "Live Website",
  },
];

export const categories = ["All", "Full Stack", "Mobile", "Frontend"] as const;
