import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./UserMenu";
import { Button } from "@/components/ui/button";
import { MdOutlineSchool } from "react-icons/md";
import { LiaUniversitySolid } from "react-icons/lia";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif font-bold text-2xl brand-text tracking-tight hover:opacity-90 transition-opacity"
        >
          EduChinaPro
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="font-medium text-primary-600 hover:text-brand-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/universities"
            className="font-medium text-primary-600 flex items-center gap-2 hover:text-brand-600 transition-colors"
          >
            <LiaUniversitySolid size={20} />
            Find Universities
          </Link>
          <Link
            href="/programs"
            className="font-medium text-primary-600 flex items-center gap-2 hover:text-brand-600 transition-colors"
          >
            <MdOutlineSchool size={20} />
            Explore Programs
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!user && (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" startIcon={<MdOutlineSchool size={20} />}>
                  Get started
                </Button>
              </Link>
            </div>
          )}
          <UserMenu user={user} />
        </div>
      </div>
    </nav>
  );
}
