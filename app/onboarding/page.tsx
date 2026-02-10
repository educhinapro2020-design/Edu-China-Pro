"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FiArrowRight } from "react-icons/fi";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      const fullName = user.user_metadata?.full_name;
      if (fullName) {
        setUserName(fullName.split(" ")[0]);
      } else if (user.email) {
        setUserName(user.email.split("@")[0]);
      }
    };
    getUser();
  }, [router]);

  const handleStart = () => {
    router.push("/dashboard/profile/build");
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-primary-50 flex items-center justify-center p-6">
      <motion.div
        className="max-w-2xl w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <div className="inline-flex items-center justify-center size-18 bg-gradient-to-br from-brand-100 to-brand-200 rounded-3xl shadow-lg shadow-brand-200/50 mb-8">
            <span className="text-4xl">🎓</span>
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="heading-1 mb-4">
          Welcome{userName ? `, ${userName}` : ""}!
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="body-large text-primary-500 max-w-2xl mx-auto mb-10"
        >
          Let's build your profile to unlock scholarship opportunities and
          connect with 12000+ universities in China.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-row-reverse items-center justify-center gap-4"
        >
          <Button
            variant="ghost"
            size="default"
            onClick={handleSkip}
            className="px-8 shadow-none font-medium"
          >
            I'll do it later
          </Button>

          <Button
            variant="brand"
            size="lg"
            onClick={handleStart}
            endIcon={<FiArrowRight className="size-5" />}
            className="px-8 shadow-lg shadow-brand-500/25"
          >
            Let's Start
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
