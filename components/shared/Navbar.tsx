import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./UserMenu";
import { NavLinks } from "./NavLinks";
import { Button } from "@/components/ui/button";
import { MdOutlineSchool } from "react-icons/md";
import Image from "next/image";

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
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <Image
            src="/images/logo/educhinapro-logo.svg"
            alt="EduChinaPro"
            width={32}
            height={32}
            className="size-12"
            priority
          />
          <span className="font-serif font-bold text-2xl brand-text tracking-tight">
            EduChinaPro
          </span>
        </Link>

        <NavLinks />

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
