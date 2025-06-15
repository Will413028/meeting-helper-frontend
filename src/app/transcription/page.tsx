"use client";
import Sidebar from "@/components/Sidebar";
import { type User, auth } from "@/utils/auth";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface TranscriptionDetail {
  transcription_id: number;
  transcription_title: string;
  tags: string[];
  audio_duration: number;
  created_at: string;
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Get transcription ID from query parameters
  const transcriptionId = searchParams?.get('id') || null;

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
          const data = (await response.json()) as { data: TranscriptionDetail };
          setTranscription(data.data);
          setDuration(data.data.audio_duration);
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

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current || !transcriptionId) return;

    const audio = audioRef.current;
    audio.src = `http://114.34.174.244:8701/api/v1/transcription/${transcriptionId}/audio`;

    const handleLoadStart = () => {
      setIsAudioLoading(true);
    };
    const handleCanPlay = () => {
      setIsAudioLoading(false);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      drawWaveform();
    };
    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [transcriptionId]);

  // Draw waveform visualization
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = 3;
    const barGap = 2;
    const barCount = Math.floor(width / (barWidth + barGap));

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Generate random waveform data (in a real app, this would be actual audio data)
    for (let i = 0; i < barCount; i++) {
      const barHeight = Math.random() * height * 0.8 + height * 0.1;
      const x = i * (barWidth + barGap);
      const y = (height - barHeight) / 2;

      // Draw bar
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, []);

  // Update waveform progress
  const updateWaveformProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const progress = audioRef.current.currentTime / audioRef.current.duration;
    const progressWidth = width * progress;

    // Redraw waveform
    drawWaveform();

    // Draw progress overlay
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(0, 0, progressWidth, height);
    ctx.restore();
  }, [drawWaveform]);

  // Animation loop for smooth progress updates
  useEffect(() => {
    const animate = () => {
      updateWaveformProgress();
      if (progressRef.current && audioRef.current) {
        const progress =
          (audioRef.current.currentTime / audioRef.current.duration) * 100;
        progressRef.current.style.width = `${progress}%`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, updateWaveformProgress]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      void audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (
    e: React.MouseEvent<HTMLDivElement | HTMLCanvasElement>,
  ) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * audioRef.current.duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
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
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Image
                src="/icons/ui/left.svg"
                alt="Back"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {transcription.transcription_title}
            </h1>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-500">上傳時間</p>
                  <p className="text-gray-900">
                    {formatDate(transcription.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">音檔長度</p>
                  <p className="text-gray-900">
                    {formatDuration(transcription.audio_duration)}
                  </p>
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

          {/* Audio Player */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {/* Waveform */}
            <div className="mb-6">
              <canvas
                ref={canvasRef}
                className="w-full h-32 cursor-pointer"
                onClick={handleSeek}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mockEvent = {
                      clientX: rect.left + rect.width / 2,
                      currentTarget: e.currentTarget,
                    } as React.MouseEvent<HTMLCanvasElement>;
                    handleSeek(mockEvent);
                  }
                }}
                tabIndex={0}
                role="slider"
                aria-label="Audio progress"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={currentTime}
              />
              <div
                className="relative h-2 bg-gray-200 rounded-full mt-4 cursor-pointer"
                onClick={handleSeek}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mockEvent = {
                      clientX: rect.left + rect.width / 2,
                      currentTarget: e.currentTarget,
                    } as React.MouseEvent<HTMLDivElement>;
                    handleSeek(mockEvent);
                  }
                }}
                tabIndex={0}
                role="slider"
                aria-label="Audio progress bar"
                aria-valuemin={0}
                aria-valuemax={Math.floor(duration)}
                aria-valuenow={Math.floor(currentTime)}
              >
                <div
                  ref={progressRef}
                  className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-none"
                  style={{ width: "0%" }}
                />
              </div>
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
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.max(
                      0,
                      audioRef.current.currentTime - 10,
                    );
                  }
                }}
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
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.min(
                      audioRef.current.duration,
                      audioRef.current.currentTime + 10,
                    );
                  }
                }}
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

            {/* Hidden Audio Element */}
            <audio ref={audioRef}>
              <track kind="captions" />
            </audio>
          </div>
        </div>
      </main>
    </div>
  );
}