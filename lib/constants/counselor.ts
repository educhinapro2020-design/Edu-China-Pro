import {
  FiFile,
  FiMessageCircle,
  FiUser,
  FiBookOpen,
  FiStar,
} from "react-icons/fi";
import { MdOutlineSchool } from "react-icons/md";
import { IconType } from "react-icons";

export interface CounselorNavItem {
  name: string;
  href: string;
  icon: IconType;
}

export const COUNSELOR_NAV_ITEMS: CounselorNavItem[] = [
  { name: "Applications", href: "/counselor/applications", icon: FiFile },
  { name: "Messages", href: "/counselor/messages", icon: FiMessageCircle },
  {
    name: "Universities",
    href: "/counselor/universities",
    icon: MdOutlineSchool,
  },

  { name: "Programs", href: "/counselor/programs", icon: FiBookOpen },
  { name: "Featured", href: "/counselor/featured", icon: FiStar },
  { name: "My Profile", href: "/counselor/profile", icon: FiUser },
];
