"use client";
import Sidebar from "@/components/Sidebar";
import { type User, auth } from "@/utils/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DiskSpace {
  total_gb: number;
  used_gb: number;
  free_gb: number;
  percent_used: number;
  mount_point: string;
}

interface Transcript {
  id: string;
  title: string;
  duration: string;
  tags: string[];
  date: string;
}

export default function TranscriptsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [diskSpace, setDiskSpace] = useState<DiskSpace | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([
    {
      id: "1",
      title: "影音檔1",
      duration: "00:15:05",
      tags: ["#會議", "#開發部門", "#專案", "#報價", "#系統"],
      date: "2025/4/30",
    },
    {
      id: "2",
      title: "影音檔2",
      duration: "00:15:05",
      tags: ["#財務管理", "#分帳", "#年度管理", "#會計"],
      date: "2025/4/30",
    },
    {
      id: "3",
      title: "影音檔2",
      duration: "00:15:05",
      tags: ["#財務管理", "#分帳", "#年度管理", "#會計"],
      date: "2025/4/30",
    },
    {
      id: "4",
      title: "影音檔2",
      duration: "00:15:05",
      tags: ["#財務管理", "#分帳", "#年度管理", "#會計"],
      date: "2025/4/30",
    },
    {
      id: "5",
      title: "影音檔2",
      duration: "00:15:05",
      tags: ["#財務管理", "#分帳", "#年度管理", "#會計"],
      date: "2025/4/30",
    },
    {
      id: "6",
      title: "影音檔2",
      duration: "00:15:05",
      tags: ["#財務管理", "#分帳", "#年度管理", "#會計"],
      date: "2025/4/30",
    },
  ]);
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

  useEffect(() => {
    // Fetch disk space data
    const fetchDiskSpace = async () => {
      try {
        const response = await fetch(
          "http://114.34.174.244:8701/api/v1/disk-space",
        );
        if (response.ok) {
          const data = (await response.json()) as DiskSpace;
          setDiskSpace(data);
        }
      } catch (error) {
        console.error("Failed to fetch disk space:", error);
      }
    };

    if (isAuthenticated) {
      void fetchDiskSpace();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log("Delete transcript:", id);
  };

  const handleDownload = (id: string) => {
    // TODO: Implement download functionality
    console.log("Download transcript:", id);
  };

  const handleMore = (id: string) => {
    // TODO: Implement more options functionality
    console.log("More options for transcript:", id);
  };

  const handleUpload = () => {
    // Navigate to upload page
    router.push("/");
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTranscripts.length) {
      // If all are selected, deselect all
      setSelectedIds(new Set());
    } else {
      // Select all filtered transcripts
      const allIds = new Set(filteredTranscripts.map((t) => t.id));
      setSelectedIds(allIds);
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchDelete = () => {
    // TODO: Implement batch delete functionality
    console.log("Batch delete transcripts:", Array.from(selectedIds));
    // After deletion, clear selection and exit batch mode
    setSelectedIds(new Set());
    setIsBatchMode(false);
  };

  const handleBatchDownload = () => {
    // TODO: Implement batch download functionality
    console.log("Batch download transcripts:", Array.from(selectedIds));
  };

  const handleEnterBatchMode = () => {
    setIsBatchMode(true);
    setSelectedIds(new Set());
  };

  const handleExitBatchMode = () => {
    setIsBatchMode(false);
    setSelectedIds(new Set());
  };

  // Filter transcripts based on search query
  const filteredTranscripts = transcripts.filter((transcript) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      transcript.title.toLowerCase().includes(searchLower) ||
      transcript.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} activeItem="manage" />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">逐字稿管理</h1>

          {/* Storage Usage Bar */}
          {diskSpace && (
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  已使用 {diskSpace.used_gb.toFixed(1)}GB
                </span>
                <span className="text-sm text-gray-600">
                  剩餘容量 {diskSpace.free_gb.toFixed(1)}GB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${diskSpace.percent_used}%` }}
                />
              </div>
            </div>
          )}

          {/* Search and Upload Bar */}
          <div className="flex gap-4 mb-6">
            {isBatchMode ? (
              <>
                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-blue-600 text-sm">
                    已選擇 {selectedIds.size} 項
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  disabled={selectedIds.size === 0}
                  className={`px-4 py-2 bg-white rounded-lg shadow-sm transition-shadow flex items-center gap-2 ${
                    selectedIds.size > 0
                      ? "text-red-600 hover:bg-red-50 hover:shadow-md"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Image
                    src="/icons/ui/del.svg"
                    alt="Delete"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  刪除
                </button>
                <button
                  type="button"
                  onClick={handleBatchDownload}
                  disabled={selectedIds.size === 0}
                  className={`px-4 py-2 bg-white rounded-lg shadow-sm transition-shadow flex items-center gap-2 ${
                    selectedIds.size > 0
                      ? "text-gray-700 hover:bg-gray-50 hover:shadow-md"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Image
                    src="/icons/ui/download.svg"
                    alt="Download"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  下載
                </button>
                <button
                  type="button"
                  onClick={handleExitBatchMode}
                  className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                >
                  <Image
                    src="/icons/ui/close.svg"
                    alt="Cancel"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  結束多筆
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEnterBatchMode}
                className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-2 text-gray-700 hover:bg-gray-50"
              >
                <Image
                  src="/icons/ui/Checkboxes-default.svg"
                  alt="Batch"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                處理多筆
              </button>
            )}

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="關鍵字搜尋"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full px-4 py-2 pl-10 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Image
                src="/icons/ui/search.svg"
                alt="Search"
                width={20}
                height={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              />
            </div>

            <button
              type="button"
              onClick={handleUpload}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Image
                src="/icons/ui/upload.svg"
                alt="Upload"
                width={20}
                height={20}
                className="w-5 h-5 brightness-0 invert"
              />
              上傳檔案
            </button>
          </div>

          {/* Select All Checkbox - Only show in batch mode */}
          {isBatchMode && filteredTranscripts.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <Image
                  src={
                    selectedIds.size === filteredTranscripts.length &&
                    filteredTranscripts.length > 0
                      ? "/icons/ui/Checkboxes-selected.svg"
                      : "/icons/ui/Checkboxes-default.svg"
                  }
                  alt="Select all"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                全選
              </button>
            </div>
          )}

          {/* Transcripts List */}
          <div className="space-y-4">
            {filteredTranscripts.map((transcript) => (
              <div
                key={transcript.id}
                className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                  selectedIds.has(transcript.id)
                    ? "ring-2 ring-blue-500 ring-opacity-50"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Checkbox - Only show in batch mode */}
                    {isBatchMode && (
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectItem(transcript.id);
                        }}
                        className="p-0"
                      >
                        <Image
                          src={
                            selectedIds.has(transcript.id)
                              ? "/icons/ui/Checkboxes-selected.svg"
                              : "/icons/ui/Checkboxes-default.svg"
                          }
                          alt="Select"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      </button>
                    )}

                    {/* Audio Icon and Duration */}
                    <div className="flex items-center gap-2">
                      <Image
                        src="/icons/ui/voice-line.svg"
                        alt="Audio"
                        width={24}
                        height={24}
                        className="w-6 h-6 text-gray-400"
                      />
                      <span className="text-gray-500 text-sm">
                        {transcript.duration}
                      </span>
                    </div>

                    {/* Title and Tags */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {transcript.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {transcript.tags.map((tag) => (
                          <span
                            key={`${transcript.id}-${tag}`}
                            className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Date */}
                    <span className="text-gray-500 text-sm">
                      {transcript.date}
                    </span>
                  </div>

                  {/* Action Buttons - Only show when not in batch mode */}
                  {!isBatchMode && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => {
                          handleDelete(transcript.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="刪除"
                      >
                        <Image
                          src="/icons/ui/del.svg"
                          alt="Delete"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleDownload(transcript.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="下載"
                      >
                        <Image
                          src="/icons/ui/download.svg"
                          alt="Download"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleMore(transcript.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="更多"
                      >
                        <Image
                          src="/icons/ui/arrow-right-linear.svg"
                          alt="More"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTranscripts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">沒有找到符合的逐字稿</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
