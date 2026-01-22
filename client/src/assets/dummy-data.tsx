import { UploadIcon, VideoIcon, ZapIcon } from "lucide-react";

export const featuresData = [
  {
    icon: <UploadIcon className="w-6 h-6" />,
    title: "Smart Upload",
    desc: "Drag & Drop your assets. We auto-optimize formats and sizes.",
  },
  {
    icon: <ZapIcon className="w-6 h-6" />,
    title: "Imstant Generation",
    desc: "Optimized models deliver output in seconds with great fidelity.",
  },
  {
    icon: <VideoIcon className="w-6 h-6" />,
    title: "Video Synthesis",
    desc: "Bring product shots to life with short-form, high-quality videos.",
  },
];

export const plansData = [
  {
    id: "starter",
    name: "Starter",
    price: "$10",
    desc: "Best for early-stage startups.",
    credits: 25,
    features: [
      "25 Credits",
      "Standard quality",
      "No watermark",
      "Slower generation speed",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    desc: "Growing teams and businesses.",
    credits: 80,
    features: [
      "80 Credits",
      "HD quality",
      "No watermark",
      "video generation",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "ultra",
    name: "Ultra",
    price: "$99",
    desc: "For brands ready to scale fast.",
    credits: 300,
    features: [
      "300 Credits",
      "FHD quality",
      "No watermark",
      "Fast generation",
      "Chat + Email support",
    ],
  },
];

export const faqData = [
  {
    question: "What does this AI video generator do?",
    answer:
      "Our platform uses AI to automatically turn your ideas, text, or media into short-form videos and reels optimized for platforms like Instagram, TikTok, and YouTube Shorts.",
  },
  {
    question: "Who is this product for?",
    answer:
      "It’s built for creators, startups, marketers, and businesses of all sizes—whether you’re growing a personal brand or scaling content for a company.",
  },
  {
    question: "How long does it take to generate a video?",
    answer:
      "Most videos are generated in just a few minutes. The exact time depends on video length, style, and selected features.",
  },
  {
    question: "Do I need video editing skills to use it?",
    answer:
      "Not at all. Our AI handles the editing, transitions, captions, and formatting—so you can create professional-looking videos with zero editing experience.",
  },
  {
    question: "Can I export videos for social media?",
    answer:
      "Yes. Videos are exported in platform-ready formats, making it easy to post directly to Instagram Reels, TikTok, YouTube Shorts, and more.",
  },
  {
    question: "Do you offer updates or support?",
    answer:
      "Absolutely. We continuously improve the AI and provide support to help you get the best results as the platform evolves.",
  },
];

export const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { name: "Home", url: "#" },
      { name: "Features", url: "#" },
      { name: "Pricing", url: "#" },
      { name: "FAQ", url: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", url: "#" },
      { name: "Terms of Service", url: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { name: "Twitter", url: "twitter.com/bibeksabat" },
      { name: "LinkedIn", url: "https://www.linkedin.com/in/bibeksabat" },
      { name: "GitHub", url: "https://github.com/iclipter" },
    ],
  },
];
