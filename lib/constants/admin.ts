import { FiLayout, FiBell, FiBook, FiBookOpen, FiFile } from "react-icons/fi";
import { MdOutlineSchool } from "react-icons/md";
import { IconType } from "react-icons";

export interface AdminNavItem {
  name: string;
  href: string;
  icon: IconType;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { name: "Dashboard", href: "/admin", icon: FiLayout },
  { name: "Applications", href: "/admin/applications", icon: FiFile },
  { name: "Universities", href: "/admin/universities", icon: MdOutlineSchool },
  { name: "Programs", href: "/admin/programs", icon: FiBookOpen },
];

export const DEGREE_LEVEL_OPTIONS = [
  { value: "bachelor", label: "Bachelor" },
  { value: "master", label: "Master" },
  { value: "doctoral", label: "Doctoral" },
  { value: "non_degree", label: "Non-Degree" },
];

export const SCHOLARSHIP_TYPE_OPTIONS = [
  { value: "self_financed", label: "Self Financed" },
  { value: "type_a", label: "Type A" },
  { value: "type_b", label: "Type B" },
  { value: "type_c", label: "Type C" },
  { value: "type_d", label: "Type D" },
];

export const INTAKE_SEASON_OPTIONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
];

export const TEACHING_LANGUAGE_OPTIONS = [
  { value: "chinese", label: "Chinese" },
  { value: "english", label: "English" },
  { value: "chinese_english_bilingual", label: "Bilingual" },
];

export const INSTITUTION_TYPE_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export const COUNTRY_SPECIFIC_LABELS: {
  key: string;
  label: string;
  color: string;
}[] = [
  {
    key: "is_985_project",
    label: "985 Project",
    color: "bg-red-100 text-red-700",
  },
  {
    key: "is_211_project",
    label: "211 Project",
    color: "bg-blue-100 text-blue-700",
  },
  {
    key: "is_double_first_class",
    label: "Double First Class",
    color: "bg-amber-100 text-amber-700",
  },
  {
    key: "is_hot_university",
    label: "Hot University",
    color: "bg-orange-100 text-orange-700",
  },
  {
    key: "is_issp_university",
    label: "ISSP University",
    color: "bg-purple-100 text-purple-700",
  },
];

export const ADMIN_ASSETS_BUCKET = "university-assets";
