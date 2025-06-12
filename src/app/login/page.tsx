"use client";
import { ICONS } from "@/constants/icons";
import { fetch } from "@tauri-apps/plugin-http";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import Orb from "@/components/Orb/Orb";

interface LoginResponse {
  access_token: string;
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
        localStorage.setItem("authToken", data.access_token);

        localStorage.setItem("user", JSON.stringify({ username }));

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
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
                    : "border-gray-300"
                }`}
                style={{
                  borderBottomColor: error
                    ? undefined
                    : username
                      ? "#333C8C"
                      : undefined,
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.target.style.borderBottomColor = "#333C8C";
                  }
                }}
                onBlur={(e) => {
                  if (!error && !username) {
                    e.target.style.borderBottomColor = "";
                  }
                }}
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
                      : "border-gray-300"
                  }`}
                  style={{
                    borderBottomColor: error
                      ? undefined
                      : password
                        ? "#333C8C"
                        : undefined,
                  }}
                  onFocus={(e) => {
                    if (!error) {
                      e.target.style.borderBottomColor = "#333C8C";
                    }
                  }}
                  onBlur={(e) => {
                    if (!error && !password) {
                      e.target.style.borderBottomColor = "";
                    }
                  }}
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
                className="w-full text-white font-medium py-4 px-6 rounded-full text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#3B3F2D" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2d3122";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#3B3F2D";
                }}
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
