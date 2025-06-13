"use client";

import Sidebar from "@/components/Sidebar";
import { auth } from "@/utils/auth";
import type { User } from "@/utils/auth";
import { useEffect, useState } from "react";

interface StorageInfo {
  used: number;
  total: number;
  percentage: number;
}

export default function SettingsPage() {
  const [autoDelete, setAutoDelete] = useState(true);
  const [clearSpace, setClearSpace] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 12.5,
    total: 50,
    percentage: 25,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const currentUser = auth.getUser();
    setUser(currentUser);

    // TODO: Fetch actual storage info from API
    // fetchStorageInfo();
  }, []);

  const handleSave = () => {
    const saveSettings = async () => {
      setIsSaving(true);

      try {
        // TODO: Implement API call to save settings
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

        console.log("Settings saved:", { autoDelete, clearSpace });

        // Show success toast
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } catch (error) {
        console.error("Failed to save settings:", error);
      } finally {
        setIsSaving(false);
      }
    };

    void saveSettings();
  };

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
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600" />
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
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600" />
              </label>
            </div>
          </div>

          {/* Storage Usage Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">儲存空間使用狀況</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">已使用空間</span>
                <span className="font-medium">
                  {storageInfo.used.toFixed(1)} GB / {storageInfo.total} GB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    storageInfo.percentage >= 80
                      ? "bg-red-500"
                      : "bg-purple-600"
                  }`}
                  style={{ width: `${storageInfo.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  使用率: {storageInfo.percentage}%
                </p>
                {storageInfo.percentage >= 80 && (
                  <p className="text-xs text-red-500 font-medium">
                    ⚠️ 儲存空間即將不足
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">其他設定</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="auto-delete-days"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  自動刪除天數
                </label>
                <select
                  id="auto-delete-days"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="30">30 天</option>
                  <option value="60">60 天</option>
                  <option value="90">90 天</option>
                  <option value="180">180 天</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="storage-threshold"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  空間使用率警告閾值
                </label>
                <select
                  id="storage-threshold"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="70">70%</option>
                  <option value="80">80%</option>
                  <option value="90">90%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <title>Loading</title>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  儲存中...
                </>
              ) : (
                "儲存設定"
              )}
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Success</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            設定已儲存
          </div>
        )}
      </main>
    </div>
  );
}
