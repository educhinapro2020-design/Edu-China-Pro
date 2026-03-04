import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join EduChinaPro to access thousands of programs at top Chinese universities. Free signup with scholarship guidance included.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
