"use client";
import Sidebar from "@/components/Sidebar";
import { type User, auth } from "@/utils/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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

interface TranscriptionApiResponse {
  total_count: number;
  total_pages: number;
  current_page: number;
  data: Array<{
    transcription_id: number;
    transcription_title: string;
    tags: string[];
    audio_duration: number;
    created_at: string;
  }>;
}

// Helper function to convert seconds to HH:MM:SS format
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((val) => val.toString().padStart(2, "0"))
    .join(":");
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}/${month}/${day}`;
};

export default function TranscriptsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [diskSpace, setDiskSpace] = useState<DiskSpace | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingTranscripts, setIsLoadingTranscripts] = useState(false);
  const pageSize = 10;
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

  // Fetch transcriptions from API
  const fetchTranscriptions = useCallback(
    async (page: number, name?: string) => {
      setIsLoadingTranscripts(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: pageSize.toString(),
        });

        if (name) {
          params.append("name", name);
        }

        const response = await fetch(
          `http://114.34.174.244:8701/api/v1/transcriptions?${params.toString()}`,
        );

        if (response.ok) {
          const data = (await response.json()) as TranscriptionApiResponse;

          // Transform API data to match Transcript interface
          const transformedTranscripts: Transcript[] = data.data.map(
            (item) => ({
              id: item.transcription_id.toString(),
              title: item.transcription_title,
              duration: formatDuration(item.audio_duration),
              tags: item.tags.map((tag) => `#${tag}`),
              date: formatDate(item.created_at),
            }),
          );

          setTranscripts(transformedTranscripts);
          setCurrentPage(data.current_page);
          setTotalPages(data.total_pages);
          setTotalCount(data.total_count);
        }
      } catch (error) {
        console.error("Failed to fetch transcriptions:", error);
      } finally {
        setIsLoadingTranscripts(false);
      }
    },
    [],
  );

  // Fetch transcriptions when authenticated or page changes
  useEffect(() => {
    if (isAuthenticated) {
      void fetchTranscriptions(currentPage, searchQuery);
    }
  }, [isAuthenticated, currentPage, searchQuery, fetchTranscriptions]);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isAuthenticated) {
        setCurrentPage(1); // Reset to first page when searching
        void fetchTranscriptions(1, searchQuery);
      }
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, isAuthenticated, fetchTranscriptions]);

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
    // Navigate to transcription detail page with query parameter
    router.push(`/transcription?id=${id}`);
  };

  const handleUpload = () => {
    // Navigate to upload page
    router.push("/");
  };

  const handleSelectAll = () => {
    if (selectedIds.size === transcripts.length) {
      // If all are selected, deselect all
      setSelectedIds(new Set());
    } else {
      // Select all transcripts on current page
      const allIds = new Set(transcripts.map((t) => t.id));
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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
                  className={`h-full rounded-full transition-all duration-500 ${
                    diskSpace.percent_used > 80
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-blue-500 to-blue-600"
                  }`}
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
          {isBatchMode && transcripts.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <Image
                  src={
                    selectedIds.size === transcripts.length &&
                    transcripts.length > 0
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
          {isLoadingTranscripts ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-600">載入中...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {transcripts.map((transcript) => (
                <div
                  key={transcript.id}
                  className={`w-full text-left bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    selectedIds.has(transcript.id)
                      ? "ring-2 ring-blue-500 ring-opacity-50"
                      : ""
                  }`}
                  onClick={(e) => {
                    // Only navigate if not clicking on action buttons or checkboxes
                    const target = e.target as HTMLElement;
                    if (
                      !target.closest("button") &&
                      !target.closest("input[type='checkbox']") &&
                      !target.closest("label") &&
                      !isBatchMode
                    ) {
                      router.push(`/transcription?id=${transcript.id}`);
                    }
                  }}
                  // biome-ignore lint/a11y/useSemanticElements: <explanation>
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      const target = e.target as HTMLElement;
                      if (
                        !target.closest("button") &&
                        !target.closest("input[type='checkbox']") &&
                        !target.closest("label") &&
                        !isBatchMode
                      ) {
                        e.preventDefault();
                        router.push(`/transcription?id=${transcript.id}`);
                      }
                    }
                  }}
                  aria-label={`View details for ${transcript.title}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Checkbox - Only show in batch mode */}
                      {isBatchMode && (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(transcript.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectItem(transcript.id);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="sr-only"
                            aria-label={`Select ${transcript.title}`}
                          />
                          <Image
                            src={
                              selectedIds.has(transcript.id)
                                ? "/icons/ui/Checkboxes-selected.svg"
                                : "/icons/ui/Checkboxes-default.svg"
                            }
                            alt=""
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                        </label>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(transcript.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="刪除"
                          aria-label="刪除"
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(transcript.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="下載"
                          aria-label="下載"
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMore(transcript.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="更多"
                          aria-label="更多"
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
          )}

          {/* Empty State */}
          {!isLoadingTranscripts && transcripts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">沒有找到符合的逐字稿</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                type="button"
                onClick={() => {
                  handlePageChange(currentPage - 1);
                }}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Image
                  src="/icons/ui/left.svg"
                  alt="Previous"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        handlePageChange(pageNum);
                      }}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  handlePageChange(currentPage + 1);
                }}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Image
                  src="/icons/ui/right.svg"
                  alt="Next"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>
            </div>
          )}

          {/* Page Info */}
          {totalCount > 0 && (
            <div className="text-center mt-4 text-sm text-gray-600">
              顯示 {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, totalCount)} 筆，共 {totalCount}{" "}
              筆
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
