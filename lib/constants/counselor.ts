import { FiFile, FiMessageCircle, FiUser } from "react-icons/fi";
import { IconType } from "react-icons";

export interface CounselorNavItem {
  name: string;
  href: string;
  icon: IconType;
}

export const COUNSELOR_NAV_ITEMS: CounselorNavItem[] = [
  { name: "Applications", href: "/counselor/applications", icon: FiFile },
  { name: "Messages", href: "/counselor/messages", icon: FiMessageCircle },
  { name: "My Profile", href: "/counselor/profile", icon: FiUser },
];
