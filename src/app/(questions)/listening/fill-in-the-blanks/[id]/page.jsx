"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import AudioPlayer from "../../../../../components/audio/AudioPlayer";

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

export default function DynamicPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  // State
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverResponse, setServerResponse] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  //==================Modal States======================
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const timerRef = useRef();
  const [timerStarted, setTimerStarted] = useState(false);

  // Dropdown answers for blanks
  const [answers, setAnswers] = useState([]);

  // Pagination dropdown (if you want to add it later)
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch question and set state
  useEffect(() => {
    async function getQuestion() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();
        if (data && data.question) {
          setCurrentQ(data.question);
          // Initial answers: one for each blank, empty string
          setAnswers(Array(data.question.blanks?.length || 0).fill(""));
        } else {
          setCurrentQ(null);
          setAnswers([]);
        }
      } catch {
        setCurrentQ(null);
        setAnswers([]);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
    }
    getQuestion();
    // eslint-disable-next-line
  }, [id]);

  // Timer logic (start on page load)
  useEffect(() => {
    if (loading) return;
    if (!timerStarted) setTimerStarted(true);
  }, [loading]);

  useEffect(() => {
    if (!timerStarted) return;
    if (timeLeft === 0) return;
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timerStarted, timeLeft]);

  // Answer change handler
  const handleAnswerChange = (idx) => (e) => {
    const arr = [...answers];
    arr[idx] = e.target.value;
    setAnswers(arr);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!currentQ) return;
    const payload = {
      questionId: currentQ._id,
      answer: answers,
    };
    try {
      setIsSubmitting(true);
      const response = await fetchWithAuth(
        `${baseUrl}/test/listening/listening-fill-in-the-blanks/result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      setServerResponse(result);
      setIsSubmitting(false);
      setIsModalOpen(!isModalOpen);
    } catch (e) {}
  };

  // Format MM:SS
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading || !currentQ) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  // Prompt split for blanks, use blanks array
  const prompt = currentQ.prompt || "";
  const blanks = currentQ.blanks || [];

  // Find blank markers (e.g., (a), (b), ...) in prompt for split
  // If you want to use a more dynamic approach, use a marker for blanks, but here we just split by blanks count
  let splitParts = [];
  let lastIndex = 0;
  let blankMarker = "__________";
  let regex = /__________/g;
  let match;
  let i = 0;
  let promptParts = [];
  // If you use a marker in prompt (e.g., __________), split that way
  if (prompt.includes(blankMarker)) {
    while ((match = regex.exec(prompt))) {
      splitParts.push(prompt.slice(lastIndex, match.index));
      lastIndex = match.index + blankMarker.length;
      i++;
    }
    splitParts.push(prompt.slice(lastIndex));
  } else {
    // fallback: just show prompt, blanks below
    splitParts = [prompt];
  }

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      {/* =========================Modal Contents starts here=============== */}
      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={() => setIsModalOpen(!isModalOpen)}
      >
        <div className="size-80 bg-white rounded-2xl flex flex-col gap-2 justify-center items-center">
          <h1 className="text-3xl font-semibold text-[#660303]">🎉 Results</h1>
          <p>
            <span className="font-bold">Score:</span>{" "}
            {serverResponse?.result?.score}
          </p>
          <p>
            <span className="font-bold">Total Correct Answer:</span>{" "}
            {serverResponse?.result?.totalCorrectAnswers}
          </p>
          <p>
            <span className="font-bold">Correct Answers Give:</span>{" "}
            {serverResponse?.result?.correctAnswersGiven.toString()}
          </p>
          <p>
            <span className="font-bold">Feedback:</span>{" "}
            {serverResponse?.feedback}
          </p>
        </div>
      </Modal>
      {/* =========================Modal Contents ends here=============== */}

      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Listening Fill in the Blanks
      </div>
      <p className="text-gray-700 mb-6">
        Listen to the audio and fill in the blanks in the passage by selecting
        the correct answer for each blank.
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
      {/* Audio Player */}
      {currentQ.audioUrl && (
        <div className="border border-[#810000] rounded bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base whitespace-pre-line">
          <AudioPlayer src={currentQ.audioUrl} />
        </div>
      )}
      {/* Prompt with answer dropdowns (if marker present) */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base whitespace-pre-line">
        {splitParts.length > 1 && blanks.length > 0 ? (
          splitParts.map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < blanks.length && (
                <span className="inline-block align-middle mx-1">
                  <select
                    value={answers[i] || ""}
                    onChange={handleAnswerChange(i)}
                    className="border border-[#810000] bg-white rounded px-2 py-1 text-[#810000] font-semibold focus:outline-none focus:ring-2 focus:ring-[#810000] appearance-none mb-1"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg width='24' height='24' fill='none' stroke='%23810000' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                      backgroundPosition: "right 0.75rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1em",
                    }}
                  >
                    <option value="">Select answer</option>
                    {blanks[i]?.options.map((opt, j) => (
                      <option key={j} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </span>
              )}
            </React.Fragment>
          ))
        ) : (
          // fallback: just show prompt, blanks options below
          <div>
            <span>{prompt}</span>
            <div className="mt-4 flex flex-col gap-2">
              {blanks.map((blank, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-bold text-[#810000] mr-1">
                    {String.fromCharCode(97 + i)}){/* (a), (b), ... */}
                  </span>
                  <select
                    value={answers[i] || ""}
                    onChange={handleAnswerChange(i)}
                    className="border border-[#810000] bg-white rounded px-2 py-1 text-[#810000] font-semibold focus:outline-none focus:ring-2 focus:ring-[#810000] appearance-none mb-1"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg width='24' height='24' fill='none' stroke='%23810000' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                      backgroundPosition: "right 0.75rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1em",
                    }}
                  >
                    <option value="">Select answer</option>
                    {blank.options.map((opt, j) => (
                      <option key={j} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Controls */}
      <div className="flex gap-3 mb-2 mt-3">
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-base"
          onClick={() => {
            setAnswers(Array(currentQ.blanks?.length || 0).fill(""));
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
          disabled={answers.some((a) => !a) || timeLeft === 0}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
      {/* Pagination: not used but kept for consistency */}
      {/* {renderPagination()} */}
    </div>
  );
}

// Modal Component
const Modal = ({ isModalOpen, children, setIsModalOpen }) => {
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling again
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup function in case modal unmounts
    };
  }, [isModalOpen]);
  return (
    <div
      onClick={setIsModalOpen}
      className={`${
        isModalOpen
          ? "h-dvh w-full fixed inset-0 z-50 bg-black/50 flex flex-col justify-center items-center"
          : "hidden"
      }`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
};
