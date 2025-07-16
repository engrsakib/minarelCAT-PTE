"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AudioPlayer from "../../../../../components/audio/AudioPlayer";

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

// Fake questions fallback (1-100 for pagination)
const FAKE_QUESTIONS = Array.from({ length: 100 }, (_, i) => ({
  _id: String(1001635 + i),
  type: "spoken_summary",
  heading: i === 0 ? "Skin Cancer" : `Fake Heading ${i + 1}`,
  audio: `https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3`,
  prompt:
    i === 0
      ? `You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 20 - 30 words. You have 8 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.`
      : `Fake prompt for question #${i + 1}`,
}));

export default function DynamicPage({ params }) {
  const { id } = params;
  const router = useRouter();

  // State
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);

  // Timer
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const timerRef = useRef();
  const [timerStarted, setTimerStarted] = useState(false);

  // Answer (text summary)
  const [answer, setAnswer] = useState("");

  // Fetch all questions and find current index
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/test/spoken-summary`);
        const data = await res.json();
        const arr =
          data?.questions && data.questions.length
            ? data.questions
            : FAKE_QUESTIONS;
        setQuestions(arr);
        const idx = arr.findIndex((q) => q._id === id);
        setCurrentIdx(idx !== -1 ? idx : 0);
        setCurrentQ(arr[idx !== -1 ? idx : 0]);
        setAnswer("");
      } catch {
        setQuestions(FAKE_QUESTIONS);
        setCurrentIdx(0);
        setCurrentQ(FAKE_QUESTIONS[0]);
        setAnswer("");
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
    }
    getQuestions();
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

  // Submit handler
  const handleSubmit = async () => {
    if (!currentQ || !answer.trim()) return;
    // Send answer as text
    const payload = {
      questionId: currentQ._id,
      summary: answer.trim(),
    };
    try {
      await fetchWithAuth("/test/spoken-summary/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      alert(
        "Your answer has been submitted! (Demo: backend response not shown)"
      );
    } catch (e) {
      alert("Something went wrong! Try again.");
    }
  };

  // Pagination controls
  const goToIndex = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    router.push(`/question/spoken-summary/${questions[idx]._id}`);
  };

  const renderPagination = () => (
    <div className="flex items-center justify-end gap-2 mt-6">
      <button
        aria-label="Prev"
        onClick={() => goToIndex(currentIdx - 1)}
        disabled={currentIdx === 0}
        className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-2">
        <span className="rounded border border-[#810000] px-3 py-1 font-bold text-[#810000] bg-white">
          {String(currentIdx + 1).padStart(3, "0")}
        </span>
        <span className="text-gray-500 font-medium">/</span>
        <span className="rounded border border-[#810000] px-3 py-1 font-bold text-[#810000] bg-white">
          {String(questions.length).padStart(3, "0")}
        </span>
      </div>
      <button
        aria-label="Next"
        onClick={() => goToIndex(currentIdx + 1)}
        disabled={currentIdx === questions.length - 1}
        className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  if (loading || !currentQ) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Summarize Spoken Text
      </div>
      <p className="text-gray-700 mb-6">
        {currentQ.prompt}
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
      <div className="border border-[#810000] rounded p-4 mb-4 bg-white flex flex-col items-center">
        <AudioPlayer src={currentQ.audio} />
      </div>
      {/* Textarea for summary */}
      <div className="mb-2">
        <textarea
          className="w-full min-h-[120px] border-2 border-[#810000] rounded bg-white p-4 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#810000] resize-none"
          placeholder="Type your summary here..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          maxLength={600}
          disabled={timeLeft === 0}
        />
        <div className="text-right text-gray-600 text-sm mt-1 mr-1">
          Word count: {wordCount.toString().padStart(2, "0")}
        </div>
      </div>
      {/* Controls */}
      <div className="flex gap-3 mb-2 mt-3">
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-base"
          onClick={() => {
            setAnswer("");
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
          disabled={answer.trim() === "" || timeLeft === 0}
        >
          Submit
        </button>
      </div>
      {renderPagination()}
      <style jsx>{`
        textarea:disabled {
          background: #eee;
          color: #bbb;
        }
      `}</style>
    </div>
  );
}