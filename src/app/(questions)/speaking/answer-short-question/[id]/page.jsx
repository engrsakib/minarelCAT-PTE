"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import MicRecorder from "mic-recorder-to-mp3";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

const RECORD_SECONDS = 40; // Answer time
const AUDIO_DURATION = 35; // For the audio player bar (UI, not actual duration)

export default function RepeatSentencePage({ params }) {
  const { id } = params;
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://example.com";

  // State
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Timer
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const timerRef = useRef();

  // Audio player
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef();

  const recorder = useRef(new MicRecorder({ bitRate: 128 }));

  // Pagination dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch question
  useEffect(() => {
    async function getQuestion() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();
        setQuestion(data?.question || null);
      } catch {
        setQuestion(null);
      }``
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setAudioProgress(0);
      setAudioBlob(null);
      setIsRecording(false);
    }
    getQuestion();
    // eslint-disable-next-line
  }, [id]);

  // Answer timer logic
  useEffect(() => {
    if (!isRecording) return;
    if (timeLeft === 0) {
      setIsRecording(false);
      stopRecording();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [isRecording, timeLeft]);

  // Audio player progress bar
  useEffect(() => {
    if (!audioPlaying) return;
    const handler = setInterval(() => {
      if (!audioRef.current) return;
      if (audioRef.current.ended || audioRef.current.paused) {
        setAudioPlaying(false);
        clearInterval(handler);
      } else {
        setAudioProgress(audioRef.current.currentTime);
      }
    }, 100);
    return () => clearInterval(handler);
  }, [audioPlaying]);

  // Play/Pause audio
  const handleAudioPlayPause = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play();
      setAudioPlaying(true);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      await recorder.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setTimeLeft(RECORD_SECONDS);
    } catch (error) {
      console.error("Recording failed", error);
    }
  };

  // Stop recording and process the audio
  const stopRecording = async () => {
    try {
      const [buffer, blob] = await recorder.current.stop().getMp3();
      setAudioBlob(blob);
      setIsRecording(false);
    } catch (error) {
      setAudioBlob(null);
      setIsRecording(false);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!audioBlob || !question) return;
    const formData = new FormData();
    formData.append("voice", audioBlob, "voice.mp3");
    formData.append("questionId", question._id);
    try {
      await fetchWithAuth("/test/speaking/repeat_sentence/submit", {
        method: "POST",
        body: formData,
      });
      alert(
        "Your answer has been submitted! (Demo: backend response not shown)"
      );
    } catch (e) {
      alert("Something went wrong! Try again.");
    }
  };

  if (loading || !question) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full lg:w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Answer a Short Question
      </div>
      <p className="text-gray-700 mb-6">
        Listen to and read a description of a situation. You will have 40 seconds to answer the question. <br />
        Please answer as completely as you can.
      </p>
      {/* Question Heading */}
      <div className="bg-[#810000] text-white px-5 py-2 rounded mb-2 text-lg font-semibold tracking-wide flex items-center gap-2">
        <span>#{question._id}</span>
        <span>|</span>
        <span>{question.heading}</span>
      </div>
      {/* Audio Player */}
      <div className="border border-[#810000] rounded p-4 mb-4 bg-[#faf9f9] flex flex-col items-center">
        <div className="w-full flex items-center gap-2">
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center shadow bg-[#810000] text-white hover:bg-[#5d0000] mr-3"
            onClick={handleAudioPlayPause}
            aria-label={audioPlaying ? "Pause audio" : "Play audio"}
            style={{ minWidth: 48 }}
          >
            {audioPlaying ? (
              // Pause icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" fill="currentColor" />
              </svg>
            ) : (
              // Play icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="M8 5v14l11-7L8 5Z" />
              </svg>
            )}
          </button>
          <audio
            ref={audioRef}
            src={question.audioUrl || ""}
            preload="auto"
            style={{ display: "none" }}
            onEnded={() => setAudioPlaying(false)}
            onPause={() => setAudioPlaying(false)}
            onPlay={() => setAudioPlaying(true)}
          />
          <span className="text-xs text-gray-600">
            {audioProgress.toFixed(2).padStart(4, "0")}
          </span>
          <div className="flex-1 h-2 rounded bg-gray-200 overflow-hidden relative">
            <div
              className="h-2 rounded bg-[#810000] transition-all duration-200"
              style={{
                width: `${((audioProgress || 0) / AUDIO_DURATION) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs text-gray-600">
            {AUDIO_DURATION.toFixed(2)}
          </span>
          <span className="ml-2">
            <svg width="22" height="22" fill="#810000" viewBox="0 0 24 24">
              <path d="M17 7v10M21 9v6M13 5v14M9 7v10M5 9v6" />
            </svg>
          </span>
        </div>
      </div>
      {/* Audio Recorder */}
      <div className="border border-[#810000] rounded p-4 mb-6 bg-[#faf9f9] flex flex-col items-center">
        <div className="flex items-center w-full gap-2 mt-2">
          <span className="text-xs text-gray-600">
            {new Date((RECORD_SECONDS - timeLeft) * 1000)
              .toISOString()
              .substr(14, 5)}
          </span>
          <div className="flex-1 h-2 rounded bg-gray-200 overflow-hidden relative">
            <div
              className="h-2 rounded bg-[#810000] transition-all duration-200"
              style={{
                width: `${
                  ((RECORD_SECONDS - timeLeft) / RECORD_SECONDS) * 100
                }%`,
              }}
            />
          </div>
          <span className="text-xs text-gray-600">
            {new Date(RECORD_SECONDS * 1000).toISOString().substr(14, 5)}
          </span>
        </div>
        <div className="mt-2 text-center w-full text-gray-500 font-medium">
          {isRecording
            ? "Recording... Speak now"
            : audioBlob
            ? "Recording complete"
            : "Click Start to record"}
        </div>
        {/* Controls */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <button
            className="flex items-center gap-1 px-4 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm"
            onClick={() => {
              setAudioBlob(null);
              setTimeLeft(RECORD_SECONDS);
              setIsRecording(false);
            }}
            disabled={isRecording}
          >
            Restart
          </button>
          <button
            className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
            onClick={handleSubmit}
            disabled={!audioBlob}
          >
            <span>Submit</span>
          </button>
          <button
            className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
            onClick={startRecording}
            disabled={isRecording || timeLeft === 0 || audioPlaying}
          >
            <span>Start</span>
          </button>
          <button
            className="flex items-center gap-1 px-4 py-1 rounded bg-gray-500 text-white font-medium text-sm hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-400"
            onClick={stopRecording}
            disabled={!isRecording}
          >
            <span>Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
}