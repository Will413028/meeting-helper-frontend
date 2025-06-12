"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

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
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch("http://114.34.174.244:8701/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.access_token) {
        // Store token in localStorage
        localStorage.setItem("authToken", data.access_token);
        
        // Store basic user info (username from form)
        localStorage.setItem("user", JSON.stringify({ username }));

        // Redirect to home page or dashboard
        router.push("/");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="mb-16">
        <h1 className="text-6xl font-bold text-black tracking-wider">
          LOGO
        </h1>
      </div>

      {/* Login Form Card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-8">
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
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-0"
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-0 py-3 pr-10 border-0 border-b-2 border-gray-300 bg-transparent text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-0"
                  placeholder="請輸入密碼"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    )}
                    {!showPassword && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-4 px-6 rounded-full text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "登入中..." : "登入"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}