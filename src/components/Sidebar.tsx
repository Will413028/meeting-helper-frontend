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
    <aside className="w-[200px] h-[740px] p-4 flex flex-col items-center gap-6 flex-shrink-0 border-r border-[#8181F3]/60 bg-[#140B1F]/80 backdrop-blur-[8px]">
      <div className="w-full flex justify-center">
        <div className="w-[100px] h-[32px] relative">
          <Image
            src="/logo.svg"
            alt="SayWe Logo"
            fill
            className="object-cover"
            priority
            onLoad={() => {
              console.log("[DEBUG] Logo loaded successfully");
            }}
            onError={(e) => {
              console.error("[DEBUG] Logo failed to load:", e);
            }}
          />
        </div>
      </div>

      <nav className="flex-1 w-full">
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex w-[168px] px-4 py-2 items-center gap-2 rounded-lg transition-all ${
                  activeItem === item.id
                    ? "border border-[#8181F3]/40 bg-gradient-to-r from-[#333C8C]/80 to-[#8181F3]/60 shadow-[inset_0_0_4px_0_rgba(181,150,233,0.4)] text-white"
                    : "text-[#E6E4E8] hover:bg-[#8181F3]/20 hover:text-[#AFAEFF]"
                }`}
              >
                <div className="flex w-6 h-6 p-[3px] pb-[0.186px] justify-center items-center aspect-square">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={24}
                    height={24}
                    className={`w-full h-full ${
                      activeItem === item.id
                        ? "brightness-0 invert"
                        : "opacity-90 invert-[91%] sepia-[8%] saturate-[180%] hue-rotate-[213deg] brightness-[95%] contrast-[87%]"
                    }`}
                  />
                </div>
                <span className="text-center font-['Noto_Sans_TC'] text-xl font-bold leading-[120%]">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-[168px] px-4 py-2 items-center gap-2 rounded-lg text-[#E6E4E8] hover:bg-[#8181F3]/20 hover:text-[#AFAEFF] transition-all"
            >
              <div className="flex w-6 h-6 p-[3px] pb-[0.186px] justify-center items-center aspect-square">
                <Image
                  src="/icons/ui/sign-out-bold.svg"
                  alt="Sign out"
                  width={24}
                  height={24}
                  className="w-full h-full opacity-90 invert-[91%] sepia-[8%] saturate-[180%] hue-rotate-[213deg] brightness-[95%] contrast-[87%]"
                />
              </div>
              <span className="text-center font-['Noto_Sans_TC'] text-xl font-bold leading-[120%]">
                登出
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {/* User info at bottom */}
      <div className="flex px-2 flex-col items-center gap-2 self-stretch mt-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="flex px-2 py-1 items-center gap-1 rounded-full bg-[#8181F3]/60">
            <p className="text-white text-center font-['Noto_Sans_TC'] text-sm font-normal leading-[100%]">
              {user?.groupName}
            </p>
          </div>
          <p className="text-[#AFAEFF] text-center font-['Noto_Sans_TC'] text-base font-normal leading-[110%]">
            {user?.userName}
          </p>
        </div>
      </div>
    </aside>
  );
}
