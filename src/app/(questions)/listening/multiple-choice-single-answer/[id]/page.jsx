"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AudioPlayer from "../../../../../components/audio/AudioPlayer";

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

export default function DynamicPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_URL;

  // State
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);

  //==================Modal States======================
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Timer
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const timerRef = useRef();
  const [timerStarted, setTimerStarted] = useState(false);

  // Single-answer selection
  const [selected, setSelected] = useState(null);

  // Pagination dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch the question (single, no fake data)
  useEffect(() => {
    async function getQuestion() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseURL}/user/get-question/${id}`);
        const data = await res.json();
        if (data?.question) {
          setCurrentQ(data.question);
          setSelected(null);
        } else {
          setCurrentQ(null);
          setSelected(null);
        }
      } catch {
        setCurrentQ(null);
        setSelected(null);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
    }
    getQuestion();
    // eslint-disable-next-line
  }, [id]);

  // Timer logic
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

  // Submit handler
  const handleSubmit = async () => {
    if (!currentQ || selected === null) return;
    const selectedAnswers = [currentQ.options[selected]];
    const payload = {
      questionId: currentQ._id,
      selectedAnswers,
    };

    try {
      const response = await fetchWithAuth(
        `${baseURL}/test/listening/multiple-choice-single-answers/result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      alert(
        "Your answer has been submitted! (Demo: backend response not shown)"
      );
    } catch (e) {
      alert("Something went wrong! Try again.");
    }
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

  // Pagination controls (dropdown + prev/next, styled right-bottom)
  // Kept as-is per your instruction, but you can remove if you want
  const renderPagination = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end w-max">
      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={() => setIsModalOpen(!isModalOpen)}
      >
        <div className="size-80 bg-white rounded-2xl flex flex-col gap-2 justify-center items-center">
          <h1 className="text-3xl font-semibold text-[#660303]">🎉 Results</h1>
          <p>
            <span className="font-bold">Score:</span> 3
          </p>
          <p>
            <span className="font-bold">Total Correct Answer:</span> 3
          </p>
          <p>
            <span className="font-bold">Feedback:</span> You scored 3 out of 3.
          </p>
        </div>
      </Modal>
      {/* Pagination controls UI code can be added here if you want */}
    </div>
  );

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Multiple Choice &amp; Single answer
      </div>
      <p className="text-gray-700 mb-6">
        Read the text and answer the multiple-choice question by selecting the
        correct response. Only one response is correct.
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
      {/* MCQ Question */}
      <div className="border border-[#810000] rounded bg-white p-3 mb-2 text-[#810000] text-base font-semibold">
        Please select only one correct answer from the options below.
      </div>
      {/* Options */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-4 mb-2">
        {currentQ.options.map((opt, i) => {
          const abc = String.fromCharCode(65 + i);
          return (
            <label
              key={i}
              className={`flex items-center gap-3 mb-2 cursor-pointer select-none group ${
                selected === i
                  ? "bg-[#f5eaea] border-2 border-[#810000] rounded"
                  : ""
              }`}
              style={{
                transition: "background 0.1s, border 0.1s",
                padding: "0.25rem 0.5rem",
              }}
            >
              <input
                type="radio"
                name="mcq"
                checked={selected === i}
                onChange={() => setSelected(i)}
                className="accent-[#810000] w-4 h-4"
                style={{ accentColor: "#810000" }}
              />
              <span
                className={`text-base font-bold flex items-center justify-center w-7 h-7 rounded-full border border-[#810000] ${
                  selected === i
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
            setSelected(null);
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
          disabled={selected === null || timeLeft === 0}
        >
          Submit
        </button>
      </div>
      {renderPagination()}
    </div>
  );
}

//==================Modal=======================
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