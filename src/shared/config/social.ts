export interface SocialLink {
  label: string;
  href: string;
  color: string;
  border: string;
  text: string;
  shadow: string;
  icon: "youtube" | "instagram" | "rutube" | "vk";
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "YouTube", href: "https://youtube.com/@avtoway", color: "#ef4444", border: "hover:border-red-500/40", text: "hover:text-red-400", shadow: "hover:shadow-red-500/20", icon: "youtube" },
  { label: "Instagram", href: "https://www.instagram.com/avtoway_by/", color: "#ec4899", border: "hover:border-pink-500/40", text: "hover:text-pink-400", shadow: "hover:shadow-pink-500/20", icon: "instagram" },
  { label: "Rutube", href: "https://rutube.ru/channel/32699183/", color: "#8b5cf6", border: "hover:border-violet-500/40", text: "hover:text-violet-400", shadow: "hover:shadow-violet-500/20", icon: "rutube" },
  { label: "VK Видео", href: "https://vk.com/video/@avtoway_channel", color: "#3b82f6", border: "hover:border-blue-500/40", text: "hover:text-blue-400", shadow: "hover:shadow-blue-500/20", icon: "vk" },
];
