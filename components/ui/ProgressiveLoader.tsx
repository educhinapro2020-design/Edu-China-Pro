"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const loadingMessages = [
  "Did you know? There are over 3,000 universities in China open to international students.",
  "Scholarships can cover up to 100% of tuition and accommodation costs.",
  "China is the 3rd most popular destination for international students.",
  "Learning basic Chinese can significantly enhance your daily life experience.",
  "Many China programs are taught entirely in English.",
  "We always check your documents against university requirements.",
  "The CGS (Chinese Government Scholarship) is one of the most prestigious awards.",
  "Preparation is key – ensure your documents are clear and valid.",
];

const adminLoadingMessages = [
  "Check application requirements properly to reduce processing time.",
  "Clear communication is the key to a smooth application process.",
  "Did you know: you can download applications in pdf format",
  "Did you know: Every activity in the admin panel is logged for audit trail.",
  "Early verfication of application documents reduces processing delays.",
  "Double-check the passport validity of applicants.",
  "Prompt responses to student inquiries improve conversion rates.",
  "Keep track of application deadlines for various scholarship programs.",
];

const MESSAGE_CHANGE_INTERVAL = 4000;

interface ProgressiveLoaderProps {
  message?: string;
  isAdmin?: boolean;
  className?: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ProgressiveLoader({
  message = "Loading...",
  isAdmin = false,
  className,
}: ProgressiveLoaderProps) {
  const messages = isAdmin ? adminLoadingMessages : loadingMessages;

  const [shuffledMessages, setShuffledMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setShuffledMessages(shuffleArray(messages));
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        let next = prev + 1;

        if (next >= shuffledMessages.length) {
          let newShuffled = shuffleArray(messages);
          if (newShuffled[0] === shuffledMessages[prev]) {
            const swapIndex =
              Math.floor(Math.random() * (newShuffled.length - 1)) + 1;
            [newShuffled[0], newShuffled[swapIndex]] = [
              newShuffled[swapIndex],
              newShuffled[0],
            ];
          }

          setShuffledMessages(newShuffled);
          return 0;
        }

        return next;
      });
    }, MESSAGE_CHANGE_INTERVAL);

    return () => clearInterval(timer);
  }, [messages, shuffledMessages]);

  return (
    <div
      className={twMerge(
        "h-full min-h-[300px] flex flex-col items-center justify-center text-center px-4 font-sans",
        className,
      )}
    >
      <div className="max-w-md flex flex-col items-center space-y-6">
        <span className="font-semibold text-xl text-primary-900">
          {message}
        </span>

        <div className="w-64 h-1.5 bg-primary-100 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-brand-600/20 w-full h-full animate-pulse"></div>
          <div
            className="h-full bg-brand-600 rounded-full animate-[progress_2s_ease-in-out_infinite] w-[40%]"
            style={{
              animation: "indeterminate-progress 1.5s infinite linear",
              transformOrigin: "0% 50%",
            }}
          />
        </div>

        <p className="text-primary-600 text-sm min-h-[3rem] transition-opacity duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-2">
          {shuffledMessages[currentIndex]}
        </p>
      </div>

      <style jsx>{`
        @keyframes indeterminate-progress {
          0% {
            transform: translateX(0) scaleX(0);
          }
          40% {
            transform: translateX(0) scaleX(0.4);
          }
          100% {
            transform: translateX(100%) scaleX(0.5);
          }
        }
      `}</style>
    </div>
  );
}
