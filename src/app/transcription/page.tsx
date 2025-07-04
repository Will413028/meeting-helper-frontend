"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

// Helper function to convert seconds to HH:MM:SS format
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [hours, minutes, secs]
    .map((val) => val.toString().padStart(2, "0"))
    .join(":");
};

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
          const result = await response.json();
          // The API returns data in data.data structure
          const transcriptionData = result.data?.data || result.data;
          setTranscription(transcriptionData);
          setDuration(transcriptionData.audio_duration);
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

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current || !transcriptionId) return;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#e5e7eb",
      progressColor: "#3b82f6",
      cursorColor: "transparent",
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 128,
      normalize: true,
      interact: true,
      url: `http://114.34.174.244:8701/api/v1/transcription/${transcriptionId}/audio`,
    });

    wavesurferRef.current = wavesurfer;

    // Event handlers
    wavesurfer.on("loading", () => {
      setIsAudioLoading(true);
    });

    wavesurfer.on("ready", () => {
      setIsAudioLoading(false);
      setDuration(wavesurfer.getDuration());
    });

    wavesurfer.on("timeupdate", (currentTime) => {
      setCurrentTime(currentTime);
    });

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
    });

    wavesurfer.on("play", () => {
      setIsPlaying(true);
    });

    wavesurfer.on("pause", () => {
      setIsPlaying(false);
    });

    // Load the audio
    void wavesurfer.load(
      `http://114.34.174.244:8701/api/v1/transcription/${transcriptionId}/audio`,
    );

    return () => {
      wavesurfer.destroy();
    };
  }, [transcriptionId]);

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

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {transcription.transcription_title}
          </h1>

          {/* Metadata - Not in white box */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">上傳時間</span>
                <span className="text-gray-900">
                  {formatDate(transcription.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">音檔長度</span>
                <span className="text-gray-900">
                  {formatDuration(transcription.audio_duration)}
                </span>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {transcription.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
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

          {/* Audio Player */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {/* Waveform */}
            <div className="mb-6">
              <div
                ref={waveformRef}
                className="w-full"
                style={{ minHeight: "128px" }}
              />
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={handleRewind}
              >
                <Image
                  src="/icons/ui/left.svg"
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
                className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAudioLoading ? (
                  <Image
                    src="/icons/ui/loading.svg"
                    alt="Loading"
                    width={32}
                    height={32}
                    className="w-8 h-8 animate-spin brightness-0 invert"
                  />
                ) : isPlaying ? (
                  <Image
                    src="/icons/ui/stop.svg"
                    alt="Pause"
                    width={32}
                    height={32}
                    className="w-8 h-8 brightness-0 invert"
                  />
                ) : (
                  <Image
                    src="/icons/ui/play-filled.svg"
                    alt="Play"
                    width={32}
                    height={32}
                    className="w-8 h-8 brightness-0 invert"
                  />
                )}
              </button>

              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={handleForward}
              >
                <Image
                  src="/icons/ui/right.svg"
                  alt="Forward"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </button>
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
