"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { auth, type User } from "@/utils/auth";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [secondaryLanguage, setSecondaryLanguage] = useState("繁體中文");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file format
      const allowedFormats = [
        "video/mp4",
        "video/avi",
        "video/webm",
        "video/x-flv",
        "video/x-ms-wmv",
        "audio/mpeg",
        "audio/wav",
        "audio/mp3",
      ];

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const allowedExtensions = [
        "mp4",
        "avi",
        "mov",
        "webm",
        "flv",
        "wmv",
        "mp3",
        "wav",
      ];

      if (
        allowedFormats.includes(file.type) ||
        (fileExtension && allowedExtensions.includes(fileExtension))
      ) {
        setSelectedFile(file);
      } else {
        alert(
          "不支援的檔案格式。請上傳 MP4、AVI、MOV、WebM、FLV、WMV、MP3 或 WAV 格式的檔案。",
        );
        event.target.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile) {
      alert("請先選擇要上傳的檔案");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append(
        "language",
        secondaryLanguage === "英文" ? "en" : "zh-TW",
      );

      const response = await fetch(
        "http://114.34.174.244:8701/api/v1/transcribe",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`上傳失敗: ${response.status} ${response.statusText}`);
      }

      const result = (await response.json()) as {
        id?: string;
        status?: string;
      };
      console.log("Transcription started:", result);

      // Show success message
      alert("檔案已成功上傳，轉錄處理中...");

      // Reset file selection
      handleRemoveFile();
    } catch (error) {
      console.error("Upload error:", error);
      alert(`上傳失敗: ${error instanceof Error ? error.message : "未知錯誤"}`);
    } finally {
      setIsUploading(false);
    }
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
      <Sidebar user={user} onLogout={handleLogout} activeItem="transcribe" />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50/5">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white text-shadow mb-4">
              智慧轉錄，更懂團隊溝通的節奏！
            </h1>
            <p className="text-white/90 text-lg text-shadow tracking-[12.96px]">
              讓溝通不留遺漏，讓記憶有跡可循。
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">主要語言</h2>
            <p className="mb-6 self-stretch text-[var(--Black,#140B1F)] font-['Noto_Sans_TC'] text-base font-normal leading-[110%]">
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
                    className="flex flex-col justify-center items-start self-stretch w-full px-3 py-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black border border-[#B6B3BA]"
                  >
                    <option value="繁體中文">繁體中文</option>
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
              <div className="file-upload-container">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.avi,.mov,.webm,.flv,.wmv,.mp3,.wav"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Image
                      src="/icons/ui/loading.svg"
                      alt="Loading"
                      width={48}
                      height={48}
                      className="w-12 h-12 animate-spin"
                    />
                    <span className="text-gray-600 font-medium">上傳中...</span>
                  </div>
                ) : !selectedFile ? (
                  <>
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <Image
                        src="/icons/ui/upload.svg"
                        alt="Upload"
                        width={48}
                        height={48}
                        className="w-12 h-12 opacity-60 hover:opacity-80 transition-opacity"
                      />
                      <span className="text-[#8181F3] hover:text-[#565AB6] font-medium">
                        選擇上傳檔案
                      </span>
                    </label>
                    <p className="text-gray-500 text-sm">
                      支援MP4、AVI、MOV、WebM、FLV、WMV、MP3、WAV格式
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/icons/ui/file.svg"
                        alt="File"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      <div className="text-left">
                        <p className="text-gray-800 font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 hover:bg-[rgba(129,129,243,0.20)] rounded-lg transition-colors"
                      title="移除檔案"
                    >
                      <Image
                        src="/icons/ui/close.svg"
                        alt="Remove"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={() => void handleTranscribe()}
                  disabled={!selectedFile || isUploading}
                  className={
                    !selectedFile || isUploading
                      ? "btn-submit-disabled"
                      : "btn-submit-default"
                  }
                >
                  轉換逐字稿
                  <Image
                    src="/icons/ui/right.svg"
                    alt="Convert"
                    width={20}
                    height={20}
                    className="w-5 h-5 brightness-0 invert"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
