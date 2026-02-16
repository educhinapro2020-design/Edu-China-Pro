import { FiFacebook, FiInstagram, FiLinkedin, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { IconType } from "react-icons";

export interface SocialLink {
  label: string;
  href: string;
  icon: IconType;
  color?: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61583342317872",
    icon: FiFacebook,
    color: "hover:bg-[#1877F2]",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/educhinapro",
    icon: FiInstagram,
    color:
      "hover:bg-[linear-gradient(45deg,#f09433_0%,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888_100%)]",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/+8615213620160",
    icon: FaWhatsapp,
    color: "hover:bg-[#25D366]",
  },
  {
    label: "Email",
    href: "mailto:educhinapro2020@gmail.com",
    icon: FiMail,
  },
];

export const CONTACT_INFO = {
  email: "educhinapro2020@gmail.com",
  whatsapp: "+8615213620160",
  displayWhatsapp: "+8615213620160",
};
