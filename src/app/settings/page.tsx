"use client";

import Sidebar from "@/components/Sidebar";
import { auth } from "@/utils/auth";
import type { User } from "@/utils/auth";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [autoDelete, setAutoDelete] = useState(true);
  const [clearSpace, setClearSpace] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = auth.getUser();
    setUser(currentUser);

    // TODO: Fetch actual storage info from API
    // fetchStorageInfo();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} activeItem="settings" />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">設定</h1>

        <div className="space-y-6 max-w-3xl">
          {/* Auto Delete Setting */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2">自動刪除</h3>
                <p className="text-gray-600 text-sm">
                  上傳日起超過30天的逐字稿原始影音檔案，將自動刪除。
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={autoDelete}
                  onChange={(e) => {
                    setAutoDelete(e.target.checked);
                  }}
                />
                <div className="w-16 h-[31px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[33px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all peer-checked:bg-[#8181F3]" />
              </label>
            </div>
          </div>

          {/* Clear Space Setting */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2">清除空間</h3>
                <p className="text-gray-600 text-sm">
                  若容量使用率達80%，將自動刪除較舊的檔案。
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={clearSpace}
                  onChange={(e) => {
                    setClearSpace(e.target.checked);
                  }}
                />
                <div className="w-16 h-[31px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[33px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all peer-checked:bg-[#8181F3]" />
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
