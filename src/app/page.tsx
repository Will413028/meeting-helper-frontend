"use client";
import { auth } from "@/utils/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [primaryLanguage, setPrimaryLanguage] = useState("繁體中文（預設）");
  const [secondaryLanguage, setSecondaryLanguage] = useState("英文");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = auth.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        router.push("/login");
      } else {
        setUser(auth.getUser());
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  };

  const handleTranscribe = () => {
    // Handle transcription logic here
    console.log("Starting transcription...");
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Only render the page content if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex relative">
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

      {/* Subtle overlay for better readability */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/30 z-[-1]" />
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/90 backdrop-blur-sm p-6 flex flex-col border-r border-gray-800">
        <div className="mb-8">
          <Image
            src="/logo.svg"
            alt="SayWe Logo"
            width={120}
            height={38}
            className="h-auto w-auto"
            priority
            onLoad={() => {
              console.log("[DEBUG] Logo loaded successfully");
            }}
            onError={(e) => {
              console.error("[DEBUG] Logo failed to load:", e);
            }}
          />
        </div>

        <nav className="flex-1">
          <ul className="space-y-4">
            <li>
              <button
                type="button"
                className="flex items-center gap-3 text-white/90 hover:text-white w-full p-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Image
                  src="/icons/ui/voice-line.svg"
                  alt="Voice"
                  width={20}
                  height={20}
                  className="w-5 h-5 brightness-0 invert"
                />
                <span>逐字稿生成</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex items-center gap-3 text-white/70 hover:text-white w-full p-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Image
                  src="/icons/ui/noto.svg"
                  alt="Notes"
                  width={20}
                  height={20}
                  className="w-5 h-5 brightness-0 invert"
                />
                <span>逐字稿管理</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex items-center gap-3 text-white/70 hover:text-white w-full p-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Image
                  src="/icons/ui/settings.svg"
                  alt="Settings"
                  width={20}
                  height={20}
                  className="w-5 h-5 brightness-0 invert"
                />
                <span>設定</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 text-white/70 hover:text-white w-full p-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Image
                  src="/icons/ui/sign-out-bold.svg"
                  alt="Sign out"
                  width={20}
                  height={20}
                  className="w-5 h-5 brightness-0 invert"
                />
                <span>登出</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* User info at bottom */}
        <div className="mt-auto pt-6 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.username.charAt(0).toUpperCase() ?? "A"}
              </span>
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium">管理員</p>
              <p className="text-white/60 text-xs">
                {user?.username ?? "Admin"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50/5">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white text-shadow mb-4">
              智慧轉錄，更懂團隊溝通的節奏！
            </h1>
            <p className="text-white/90 text-lg text-shadow">
              讓溝通不留遺漏，讓記憶有跡可循。
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">主要語言</h2>
            <p className="text-gray-600 mb-6">
              可以設定逐字稿所需要的語言，增加精準度！
            </p>

            <div className="space-y-6">
              {/* Language Dropdown */}
              <div>
                <div className="relative">
                  <select
                    id="secondary-language"
                    value={secondaryLanguage}
                    onChange={(e) => {
                      setSecondaryLanguage(e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
                  >
                    <option value="繁體中文">繁體中文（預設）</option>
                    <option value="英文">英文</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  選擇上傳檔案
                </button>
                <p className="text-gray-500 text-sm mt-2">
                  支援MP4、AVI、MOV、WebM、FLV、WMV、MP3、WAV格式
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={handleTranscribe}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-200 flex items-center gap-2 shadow-lg"
                >
                  轉換逐字稿
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
