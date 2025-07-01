"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, type User } from "@/utils/auth";

interface SidebarProps {
  user: User | null;
  onLogout?: () => void;
  activeItem?: "transcribe" | "manage" | "settings";
}

export default function Sidebar({
  user,
  onLogout,
  activeItem = "transcribe",
}: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      auth.logout();
      router.push("/login");
    }
  };

  const menuItems = [
    {
      id: "transcribe",
      icon: "/icons/ui/voice-line.svg",
      label: "逐字稿生成",
      href: "/",
    },
    {
      id: "manage",
      icon: "/icons/ui/noto.svg",
      label: "逐字稿管理",
      href: "/manage",
    },
    {
      id: "settings",
      icon: "/icons/ui/settings.svg",
      label: "設定",
      href: "/settings",
    },
  ];

  return (
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
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                  activeItem === item.id
                    ? "text-white/90 hover:text-white hover:bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={20}
                  height={20}
                  className="w-5 h-5 brightness-0 invert"
                />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
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
              {user?.userName.charAt(0).toUpperCase() ?? "A"}
            </span>
          </div>
          <div>
            <p className="text-white/90 text-sm font-medium">
              {user?.groupName}
            </p>
            <p className="text-white/60 text-xs">{user?.userName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
