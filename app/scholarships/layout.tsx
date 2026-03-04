import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scholarships — Study in China with Financial Support",
  description:
    "Explore scholarship opportunities at China's top universities. CSC scholarships, provincial grants, and university-specific financial aid for international students.",
};

export default function ScholarshipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
