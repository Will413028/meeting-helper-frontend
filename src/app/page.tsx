"use client";
import { RoundedButton } from "@/components/RoundedButton";
import { ICONS } from "@/constants/icons";
import { auth } from "@/utils/auth";
import { invoke } from "@tauri-apps/api/core";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [greeted, setGreeted] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
    setUser(auth.getUser());
  }, []);

  const greet = useCallback((): void => {
    invoke<string>("greet")
      .then((s) => {
        setGreeted(s);
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }, []);

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
      >
        <source src="/background.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay for better content readability */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/30 z-[-1]" />
      {/* Authentication Status Bar */}
      <div className="fixed top-4 right-4 flex items-center gap-4 bg-enhanced px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Welcome, {user?.username}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Login
          </Link>
        )}
      </div>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start video-overlay-content">
        <Image
          className="dark:invert drop-shadow-lg"
          src={ICONS.brands.next}
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] text-shadow">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex flex-col gap-2 items-start">
          <RoundedButton
            onClick={greet}
            title="Call &quot;greet&quot; from Rust"
          />
          <p className="break-words w-md text-shadow">
            {greeted ?? "Click the button to call the Rust function"}
          </p>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center video-overlay-content">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src={ICONS.ui.file}
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src={ICONS.ui.window}
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src={ICONS.ui.globe}
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
