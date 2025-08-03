"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AudioPlayer from "@/components/audio/AudioPlayer";

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

// Beautiful Result Modal Component (theme styled)
const ResultModal = React.memo(function ResultModal({
  isOpen,
  onClose,
  result,
  feedback,
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-gradient-to-br from-[#7D0000]/70 via-[#fff]/60 to-[#810000]/70 flex justify-center items-center backdrop-blur-md transition-all"
      style={{ animation: "fadeIn 0.3s" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl px-8 py-8 flex flex-col gap-6 items-center relative border-4 border-[#810000]/20 max-w-md w-full animate-popup"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7D0000] hover:text-[#810000] text-2xl cursor-pointer font-bold bg-white/70 px-2 rounded-full border border-[#810000]/30 shadow"
          title="Close"
        >
          ×
        </button>

        <div className="flex items-center justify-center mb-2 gap-2">
          <span className="text-4xl">🎉</span>
          <span className="ml-1 text-3xl font-extrabold text-[#810000] drop-shadow">Results</span>
        </div>

        <div className="flex gap-7 w-full justify-center mb-2">
          <div className="flex flex-col items-center">
            <span className="text-base font-semibold text-[#7D0000]">Score</span>
            <span className="text-xl font-bold text-[#810000]">{result?.score ?? "-"}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-semibold text-[#7D0000]">Correct</span>
            <span className="text-xl font-bold text-[#810000]">{result?.totalCorrectAnswers ?? "-"}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-semibold text-[#7D0000]">Your Correct</span>
            <span className="text-xl font-bold text-[#810000]">{result?.correctAnswersGiven?.toString() ?? "-"}</span>
          </div>
        </div>
        <div className="mt-2 mb-2 w-full px-2">
          <span className="font-bold text-[#810000]">Feedback:</span>
          <span className="block text-gray-700 text-base mt-1 bg-[#faf9f9] p-3 rounded-xl border border-[#810000]/20 shadow-sm">
            {feedback ?? "No feedback"}
          </span>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        .animate-popup {
          animation: popup 0.35s cubic-bezier(.2,1.5,.5,1) both;
        }
        @keyframes popup {
          0% { transform: scale(.8) translateY(40px); opacity: 0;}
          100% { transform: scale(1) translateY(0); opacity: 1;}
        }
      `}</style>
    </div>
  );
});

function DynamicPageComponent({ params }) {
  const [serverResponse, setServerResponse] = useState({});
  const { id } = params;
  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_URL;

  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const timerRef = useRef();
  const [timerStarted, setTimerStarted] = useState(false);

  const [selected, setSelected] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Memoized fetch function so it doesn't auto-call
  const getQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${baseURL}/user/get-question/${id}`);
      const data = await res.json();
      if (data?.question) {
        setCurrentQ(data.question);
        setSelected([]);
      } else {
        setCurrentQ(null);
        setSelected([]);
      }
    } catch {
      setCurrentQ(null);
      setSelected([]);
    }
    setLoading(false);
    setTimeLeft(RECORD_SECONDS);
    setTimerStarted(false);
  }, [baseURL, id]);

  useEffect(() => {
    getQuestion();
    // eslint-disable-next-line
  }, [getQuestion]);

  // Timer logic (start on page load)
  useEffect(() => {
    if (loading) return;
    if (!timerStarted) setTimerStarted(true);
  }, [loading, timerStarted]);

  useEffect(() => {
    if (!timerStarted) return;
    if (timeLeft === 0) return;
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timerStarted, timeLeft]);

  // Memoized handlers
  const handleOptionChange = useCallback((idx) => {
    setSelected((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      } else {
        return [...prev, idx];
      }
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    if (!currentQ || selected.length === 0) return;
    const selectedAnswers = selected.map((eachId) => currentQ.options[eachId]);
    const payload = {
      questionId: currentQ._id,
      answer: selectedAnswers,
    };

    try {
      const response = await fetchWithAuth(
        `${baseURL}/test/listening/multiple-choice-multiple-answers/result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      setServerResponse(await response.json());
      setIsSubmitting(true);
      setIsModalOpen(true);
    } catch (e) {}
  }, [currentQ, selected, baseURL]);

  // Format MM:SS
  const formatTime = useCallback((sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, []);

  if (loading || !currentQ) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      {/* ============== Beautiful Result Modal =============== */}
      <ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={serverResponse?.result}
        feedback={serverResponse?.feedback}
      />
      {/* ============== End Result Modal =============== */}

      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Multiple Choice &amp; Multiple answer
      </div>
      <p className="text-gray-700 mb-6">
        Read the text and answer the multiple-choice question by selecting all
        correct responses. You may select more than one response.
      </p>
      {/* Question Heading */}
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded px-4 py-2 font-bold text-white bg-[#810000] text-base tracking-wide">
          #{currentQ._id}
        </span>
        <span className="text-lg font-semibold text-[#810000]">
          {currentQ.heading}
        </span>
      </div>
      {/* Timer */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[#810000] font-medium text-base">
          Remaining Time:{" "}
          <span className="font-bold">00: {formatTime(timeLeft)} sec</span>
        </span>
      </div>
      {/* Prompt */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base whitespace-pre-line">
        {currentQ.audioUrl && <AudioPlayer src={currentQ.audioUrl} />}
        {currentQ.prompt && (
          <div className="mt-2 text-[#333] text-base">{currentQ.prompt}</div>
        )}
      </div>
      {/* MCQ Options */}
      <div className="border border-[#810000] rounded bg-white p-3 mb-2 text-[#810000] text-base font-semibold">
        নিচের অপশনগুলো থেকে একাধিক সঠিক উত্তরের অপশন সিলেক্ট করুন।
      </div>
      {/* Options */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-4 mb-2">
        {currentQ.options.map((opt, i) => {
          const abc = String.fromCharCode(65 + i);
          return (
            <label
              key={i}
              className={`flex items-center gap-3 mb-2 cursor-pointer select-none group ${
                selected.includes(i)
                  ? "bg-[#f5eaea] border-2 border-[#810000] rounded"
                  : ""
              }`}
              style={{
                transition: "background 0.1s, border 0.1s",
                padding: "0.25rem 0.5rem",
              }}
            >
              <input
                type="checkbox"
                name="mcq"
                checked={selected.includes(i)}
                onChange={() => handleOptionChange(i)}
                className="accent-[#810000] w-4 h-4"
                style={{ accentColor: "#810000" }}
              />
              <span
                className={`text-base font-bold flex items-center justify-center w-7 h-7 rounded-full border border-[#810000] ${
                  selected.includes(i)
                    ? "bg-[#810000] text-white"
                    : "bg-white text-[#810000]"
                }`}
                style={{
                  minWidth: 28,
                  minHeight: 28,
                }}
              >
                {abc}
              </span>
              <span className="text-gray-800 font-normal text-base">{opt}</span>
            </label>
          );
        })}
      </div>
      {/* Controls */}
      <div className="flex gap-3 mb-2 mt-3">
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-base"
          onClick={() => {
            setSelected([]);
            setTimeLeft(RECORD_SECONDS);
            setTimerStarted(false);
          }}
          disabled={timeLeft === 0}
        >
          Restart
        </button>
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border-2 border-[#810000] bg-white text-[#810000] font-semibold text-base hover:bg-[#810000] hover:text-white transition"
          onClick={handleSubmit}
          disabled={selected.length === 0 || timeLeft === 0}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

// Memoized main component
const DynamicPage = React.memo(DynamicPageComponent);
export default DynamicPage;