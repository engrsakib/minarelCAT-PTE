"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import AudioPlayer from "../../../../../components/audio/AudioPlayer";
import MicRecorder from "mic-recorder-to-mp3";

// Constants
const RECORD_SECONDS = 40; // Answer time
const PREPARE_SECONDS = 35; // Preparation time before answer

export default function RepeatSentencePage({ params }) {
  const { id } = params;
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  // State
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Timers
  const [prepTime, setPrepTime] = useState(PREPARE_SECONDS);
  const [isThinking, setIsThinking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const timerRef = useRef();

  // Audio player
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef();

  // Mic Recorder instance
  const recorder = useRef(null);

  // Fetch the question
  useEffect(() => {
    async function getQuestion() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();
        setQuestion(data?.question || null);
      } catch {
        setQuestion(null);
      }
      setLoading(false);
      setPrepTime(PREPARE_SECONDS);
      setIsThinking(true);
      setTimeLeft(RECORD_SECONDS);
      setAudioBlob(null);
      setIsRecording(false);
    }
    getQuestion();
    // eslint-disable-next-line
  }, [id]);

  // Prepare/Thinking timer logic
  useEffect(() => {
    if (!isThinking) return;
    if (prepTime === 0) {
      setIsThinking(false);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      }, 500); // small delay after prep
      return;
    }
    timerRef.current = setTimeout(() => setPrepTime((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [isThinking, prepTime]);

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

  // Audio play handler
  const handleAudioPlay = () => {
    setAudioPlaying(true);
  };
  const handleAudioEnded = () => {
    setAudioPlaying(false);
    setIsRecording(true);
    setTimeLeft(RECORD_SECONDS);
  };

  // Start recording function
  const startRecording = () => {
    if (recorder.current) {
      recorder.current.start().then(() => {
        setIsRecording(true);
        setAudioBlob(null);
        setTimeLeft(RECORD_SECONDS);
      });
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (recorder.current) {
      recorder.current.stop().getMp3().then(([buffer, blob]) => {
        setAudioBlob(blob);
        setIsRecording(false);
      });
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
      alert("Your answer has been submitted! (Demo: backend response not shown)");
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
      {/* Title/Heading */}
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        {question.heading}
      </div>
      <p className="text-gray-700 mb-6">
        Listen to and read a description of a situation. You will have 35
        seconds to think about your answer. Then you will hear a beep. You will
        have 40 seconds to answer the question. <br />
        Please answer as completely as you can.
      </p>
      {/* Timer */}
      <div className="mb-2 text-[#810000] font-medium text-base">
        Beginning in{" "}
        <span className="font-bold">{isThinking ? prepTime : "0"}</span> sec
      </div>
      {/* Audio Player */}
      <div className="border border-[#810000] rounded p-4 mb-4 bg-[#faf9f9] flex flex-col items-center">
        {/* Use audioUrl from DB */}
        {question.audioUrl && (
          <audio
            ref={audioRef}
            src={question.audioUrl}
            onPlay={handleAudioPlay}
            onEnded={handleAudioEnded}
            controls
            style={{ width: "100%" }}
          />
        )}
      </div>
      {/* Prompt */}
      <div className="border border-[#810000] rounded p-4 mb-4 bg-white text-gray-900 whitespace-pre-line">
        {question.prompt}
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
            onClick={() => {
              if (!isRecording && timeLeft > 0 && !isThinking) {
                setTimeLeft(RECORD_SECONDS);
                setAudioBlob(null);
                setIsRecording(true);
                startRecording();
              }
            }}
            disabled={
              isRecording || timeLeft === 0 || isThinking || audioPlaying
            }
          >
            <span>Start</span>
          </button>
          <button
            className="flex items-center gap-1 px-4 py-1 rounded bg-gray-500 text-white font-medium text-sm hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-400"
            onClick={() => stopRecording()}
            disabled={!isRecording}
          >
            <span>Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
}
