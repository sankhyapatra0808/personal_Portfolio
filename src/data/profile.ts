export type SkillGroup = {
  title: string;
  summary: string;
  skills: string[];
};

export type TimelineItem = {
  period: string;
  title: string;
  organisation: string;
  description: string;
};

export const profile = {
  name: "Sankhya Patra",
  shortName: "Sankhya",
  role: "Full-Stack Developer",
  location: "India",
  education: "B.Tech in Computer Science and Engineering, KIIT, Bhubaneswar",
  intro:
    "I build practical web and mobile products with a focus on reliable architecture, thoughtful interfaces and real-world usability.",
  about:
    "I am a Computer Science and Engineering student and product-focused developer. My work spans full-stack web applications, mobile experiences, authentication, payments, real-time updates and carefully designed user interfaces. I enjoy turning complex workflows into products that feel clear and dependable.",
  availability: "Open to software engineering opportunities and meaningful collaborations.",
  email: "",
  github: "https://github.com/sankhyapatra0808",
  linkedin: "#",
  resumeUrl: "",
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend Engineering",
    summary: "Responsive, accessible interfaces built for real product workflows.",
    skills: ["React", "TypeScript", "Vite", "CSS", "React Router", "Responsive UI"],
  },
  {
    title: "Backend & Data",
    summary: "Typed APIs, relational data models and production-minded server design.",
    skills: ["Node.js", "Express", "PostgreSQL", "Neon", "REST APIs", "Server-Sent Events"],
  },
  {
    title: "Product Infrastructure",
    summary: "The services that make applications secure, connected and useful.",
    skills: ["Firebase Auth", "Firebase Admin", "Razorpay", "Cloudinary", "Brevo", "Argon2"],
  },
  {
    title: "Mobile Development",
    summary: "Native-feeling mobile products connected to shared backend systems.",
    skills: ["React Native", "Expo", "Expo Router", "AsyncStorage", "Secure Store", "Android"],
  },
];

export const experience: TimelineItem[] = [
  {
    period: "2026 — Present",
    title: "Creator & Full-Stack Developer",
    organisation: "SplitVerse",
    description:
      "Designed and developed a fair item-wise expense platform across web and mobile, including authentication, rooms, settlements, wallets, friends, notifications and production deployment workflows.",
  },
  {
    period: "2026",
    title: "Frontend & Firebase Developer",
    organisation: "DevArena",
    description:
      "Built a developer-growth platform with authentication, profiles, activity heatmaps, rankings, streaks, challenges and a premium responsive dashboard experience.",
  },
  {
    period: "Ongoing",
    title: "Computer Science Student",
    organisation: "KIIT, Bhubaneswar",
    description:
      "Developing a broad software engineering foundation through academic work, personal products and continuous hands-on problem solving.",
  },
];
