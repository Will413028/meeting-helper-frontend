"use client";
import { fetch } from "@tauri-apps/plugin-http";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import Orb from "@/components/Orb/Orb";
import { ICONS } from "@/constants/icons";

interface LoginResponse {
  access_token: string;
  group_name: string;
  user_name: string;
  role: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch("http://114.34.174.244:8701/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = (await response.json()) as LoginResponse;

      if (response.ok && data.access_token) {
        // Save auth token
        localStorage.setItem("authToken", data.access_token);

        // Save complete user information with camelCase property names to match User interface
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: username, // Using username as id since API doesn't return a separate id
            userName: data.user_name,
            groupName: data.group_name,
            role: data.role,
          }),
        );

        router.push("/");
      } else {
        setError("帳號或密碼錯誤");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("網路錯誤，請檢查連線後重試");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Orb Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full relative">
          <Orb
            hoverIntensity={5}
            rotateOnHover={true}
            hue={0}
            forceHoverState={true}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Logo */}
        <div className="mb-16 flex justify-center">
          <Image
            src="/logo.svg"
            alt="SayWe Logo"
            width={200}
            height={64}
            priority
            className="mx-auto"
          />
        </div>

        {/* Login Form Card */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <form
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
              className="space-y-8"
            >
              {/* Username Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-lg font-medium text-black mb-3"
                >
                  帳號
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  required
                  className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-0 ${
                    error
                      ? "border-red-500 focus:border-red-500"
                      : username
                        ? "border-b-[#333C8C] focus:border-b-[#333C8C]"
                        : "border-gray-300 focus:border-b-[#333C8C]"
                  }`}
                  placeholder="請輸入帳號"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-lg font-medium text-black mb-3"
                >
                  密碼
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    required
                    className={`w-full px-0 py-3 pr-10 border-0 border-b-2 bg-transparent text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-0 ${
                      error
                        ? "border-red-500 focus:border-red-500"
                        : password
                          ? "border-b-[#333C8C] focus:border-b-[#333C8C]"
                          : "border-gray-300 focus:border-b-[#333C8C]"
                    }`}
                    placeholder="請輸入密碼"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-0 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                  >
                    <Image
                      src={showPassword ? ICONS.ui.eyeOn : ICONS.ui.eyeOff}
                      alt={showPassword ? "顯示密碼" : "隱藏密碼"}
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </button>
                </div>
                {error && (
                  <div className="mt-2 text-red-500 text-sm">{error}</div>
                )}
              </div>

              {/* Login Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white font-medium py-4 px-6 rounded-full text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-[#3B3F2D] hover:bg-[#2d3122]"
                >
                  {isLoading ? "登入中..." : "登入"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
