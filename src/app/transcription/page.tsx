"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Sidebar from "@/components/Sidebar";
import { auth, type User } from "@/utils/auth";

interface TranscriptionDetail {
  transcription_id: number;
  transcription_title: string;
  tags: string[];
  audio_duration: number;
  created_at: string;
  summary?: string;
  transcription_text?: string;
}

// Helper function to format time for display
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}/${month}/${day}`;
};

export default function TranscriptionDetailPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transcription, setTranscription] =
    useState<TranscriptionDetail | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  // Get transcription ID from query parameters
  const transcriptionId = searchParams?.get("id") ?? null;

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

  // Fetch transcription details
  useEffect(() => {
    const fetchTranscriptionDetail = async () => {
      if (!isAuthenticated || !transcriptionId) return;

      try {
        const response = await fetch(
          `http://114.34.174.244:8701/api/v1/transcription/${transcriptionId}`,
        );

        if (response.ok) {
          const result = (await response.json()) as {
            data: { data?: TranscriptionDetail } | TranscriptionDetail;
          };
          // The API returns data in data.data structure
          let transcriptionData: TranscriptionDetail | undefined;

          if (typeof result.data === "object" && "data" in result.data) {
            transcriptionData = result.data.data;
          } else if ("transcription_id" in result.data) {
            transcriptionData = result.data;
          }

          if (transcriptionData) {
            setTranscription(transcriptionData);
            setDuration(transcriptionData.audio_duration);
          }
        } else {
          console.error("Failed to fetch transcription details");
          router.push("/manage");
        }
      } catch (error) {
        console.error("Error fetching transcription:", error);
        router.push("/manage");
      }
    };

    void fetchTranscriptionDetail();
  }, [isAuthenticated, transcriptionId, router]);

  // Initialize WaveSurfer function
  const initializeWaveSurfer = useCallback(() => {
    if (!waveformRef.current || !transcriptionId) {
      console.log("Cannot initialize - missing ref or ID");
      return;
    }

    try {
      // Destroy existing instance if any
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }

      console.log("Initializing WaveSurfer...");

      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#E5E5E5",
        progressColor: "#8181F3",
        cursorColor: "#8181F3",
        cursorWidth: 2,
        barWidth: 4,
        barGap: 4,
        barRadius: 3,
      });

      wavesurferRef.current = ws;

      ws.on("ready", () => {
        console.log("WaveSurfer ready");
        setIsAudioLoading(false);
        setDuration(ws.getDuration());
      });

      ws.on("error", (e) => {
        console.error("WaveSurfer error:", e);
        setIsAudioLoading(false);
      });

      ws.on("play", () => {
        setIsPlaying(true);
      });
      ws.on("pause", () => {
        setIsPlaying(false);
      });
      ws.on("timeupdate", (time) => {
        setCurrentTime(time);
      });

      const url = `http://114.34.174.244:8701/api/v1/transcription/${transcriptionId}/audio`;
      void ws.load(url);

      console.log("WaveSurfer initialized successfully");
    } catch (error) {
      console.error("Failed to initialize WaveSurfer:", error);
    }
  }, [transcriptionId]);

  // Try to initialize on mount and when transcription data is loaded
  useEffect(() => {
    if (!transcription || !waveformRef.current || !transcriptionId) return;

    // Use a flag to prevent double initialization
    let mounted = true;

    const timer = setTimeout(() => {
      if (mounted && !wavesurferRef.current) {
        initializeWaveSurfer();
      }
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [transcription, transcriptionId, initializeWaveSurfer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!wavesurferRef.current) return;

    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      void wavesurferRef.current.play();
    }
  };

  const handleRewind = () => {
    if (!wavesurferRef.current) return;
    const currentTime = wavesurferRef.current.getCurrentTime();
    wavesurferRef.current.seekTo(
      Math.max(0, currentTime - 10) / wavesurferRef.current.getDuration(),
    );
  };

  const handleForward = () => {
    if (!wavesurferRef.current) return;
    const currentTime = wavesurferRef.current.getCurrentTime();
    const duration = wavesurferRef.current.getDuration();
    wavesurferRef.current.seekTo(
      Math.min(duration, currentTime + 10) / duration,
    );
  };

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  };

  const handleBack = () => {
    router.push("/manage");
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete transcription:", transcriptionId);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download transcription:", transcriptionId);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit transcription:", transcriptionId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !transcription) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} activeItem="manage" />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mb-4"
          >
            <Image
              src="/icons/ui/left.svg"
              alt="Back"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>

          {/* Title and Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {transcription.transcription_title}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="編輯"
              >
                <Image
                  src="/icons/ui/edit-line.svg"
                  alt="Edit"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>
              <button
                type="button"
                onClick={handleDownload}
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
                onClick={handleDelete}
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
            </div>
          </div>

          {/* Metadata - Not in white box */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span
                className="text-base font-bold leading-[110%]"
                style={{ color: "#3E3747" }}
              >
                上傳時間
              </span>
              <span
                className="text-base font-normal leading-[110%]"
                style={{ color: "#8E8A93" }}
              >
                {formatDate(transcription.created_at)}
              </span>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {transcription.tags.map((tag) => (
                <span
                  key={tag}
                  className="tag-item flex px-2 py-1 justify-center items-center rounded-lg text-sm font-medium"
                  style={{
                    background: "rgba(73, 129, 190, 0.20)",
                    color: "#346392",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {/* Waveform */}
            <div className="mb-2 relative">
              <div
                ref={waveformRef}
                className="w-full"
                style={{ minHeight: "58px" }}
              />
              {isAudioLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 rounded">
                  <div className="text-gray-600">Loading audio...</div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <button
                type="button"
                className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative p-0 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={(e) => {
                  if (!wavesurferRef.current || duration === 0) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const clickPercent = clickX / rect.width;
                  wavesurferRef.current.seekTo(clickPercent);
                }}
                aria-label="Seek audio position"
              >
                <div
                  className="h-full rounded-full transition-all duration-100 pointer-events-none"
                  style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    backgroundColor: "#8181F3",
                  }}
                />
              </button>
            </div>

            {/* Controls and Time Display Container */}
            <div className="flex items-center justify-between">
              {/* Current Time */}
              <span className="text-sm text-gray-600 min-w-[45px]">
                {formatTime(currentTime)}
              </span>

              {/* Control Buttons */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={handleRewind}
                >
                  <Image
                    src="/icons/ui/arrow-left-spin.svg"
                    alt="Rewind"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </button>

                <button
                  type="button"
                  onClick={handlePlayPause}
                  disabled={isAudioLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAudioLoading ? (
                    <Image
                      src="/icons/ui/loading.svg"
                      alt="Loading"
                      width={24}
                      height={24}
                      className="w-6 h-6 animate-spin"
                    />
                  ) : isPlaying ? (
                    <Image
                      src="/icons/ui/stop.svg"
                      alt="Pause"
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  ) : (
                    <Image
                      src="/icons/ui/play-filled.svg"
                      alt="Play"
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  )}
                </button>

                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={handleForward}
                >
                  <Image
                    src="/icons/ui/arrow-right-spin.svg"
                    alt="Forward"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </button>
              </div>

              {/* Duration */}
              <span className="text-sm text-gray-600 min-w-[45px] text-right">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Summary and Transcription Section - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary Section - Left Side with Scroll */}
            {transcription.summary && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">摘要</h2>
                <div className="text-gray-700 whitespace-pre-wrap max-h-[600px] overflow-y-auto pr-2">
                  {transcription.summary}
                </div>
              </div>
            )}

            {/* Transcription Text Section - Right Side with Scroll */}
            {transcription.transcription_text && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">逐字稿</h2>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto pr-2">
                  {transcription.transcription_text}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
