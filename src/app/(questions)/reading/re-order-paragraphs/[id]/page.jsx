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

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

function shuffle(array) {
  // Fisher-Yates Shuffle
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ResultModal({ isOpen, onClose, result }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-[#810000]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-[#810000]">Result</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Score:</span>
              <span className="text-2xl font-bold text-green-600">
                {result.score}%
              </span>
            </div>
            <p className="text-gray-700 mb-6">{result.message}</p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2 text-[#810000]">
              Your Answer:
            </h4>
            <ol className="list-decimal pl-5 space-y-2">
              {result.userAnswer.map((item, i) => (
                <li key={i} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2 text-[#810000]">
              Correct Answer:
            </h4>
            <ol className="list-decimal pl-5 space-y-2">
              {result.correctAnswer.map((item, i) => (
                <li key={i} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-[#810000] text-white rounded-md hover:bg-[#6a0000] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

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

  // Source (left) and Target (right) state for drag-and-drop
  const [source, setSource] = useState([]);
  const [target, setTarget] = useState([]);
  const [dragged, setDragged] = useState(null);

  // Pagination dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  // Result modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [result, setResult] = useState({
    score: 0,
    message: "",
    userAnswer: [],
    correctAnswer: [],
  });

  // On mount/fetch question
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();

        let arr = [];
        let idx = 0;
        let questionObj = null;

        if (
          data.questions &&
          Array.isArray(data.questions) &&
          data.questions.length
        ) {
          arr = data.questions;
          idx = arr.findIndex((q) => q._id === id);
          questionObj = arr[idx !== -1 ? idx : 0];
        } else if (data.question) {
          arr = [data.question];
          idx = 0;
          questionObj = data.question;
        }

        setQuestions(arr);
        setCurrentIdx(idx);
        setCurrentQ(questionObj);

        const optionsArr = questionObj?.options || [];
        const shuffled = shuffle(
          optionsArr.map((text, i) => ({
            label: String.fromCharCode(97 + i).toUpperCase(),
            text,
            idx: i,
          }))
        );
        setSource(shuffled);
        setTarget([]);
      } catch {
        setQuestions([]);
        setCurrentIdx(0);
        setCurrentQ(null);
        setSource([]);
        setTarget([]);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
    }
    getQuestions();
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

  // Drag/Drop handlers
  const handleDragStart = (item, fromSource, idx) => {
    setDragged({ ...item, fromSource, idx });
  };

  const handleDropTarget = () => {
    if (dragged && dragged.fromSource) {
      setTarget((prev) => [
        ...prev,
        {
          ...dragged,
          label: String.fromCharCode(97 + prev.length).toUpperCase(),
        },
      ]);
      setSource((prev) => prev.filter((_, i) => i !== dragged.idx));
    }
    setDragged(null);
  };

  const handleDropSource = () => {
    if (dragged && !dragged.fromSource) {
      setSource((prev) => [...prev, dragged]);
      setTarget((prev) => prev.filter((_, i) => i !== dragged.idx));
    }
    setDragged(null);
  };

  const handleDragOverTarget = (overIdx) => {
    if (!dragged || !!dragged.fromSource) return;
    setTarget((prev) => {
      const arr = prev.slice();
      arr.splice(dragged.idx, 1);
      arr.splice(overIdx, 0, dragged);
      return arr.map((item, i) => ({
        ...item,
        label: String.fromCharCode(97 + i).toUpperCase(),
      }));
    });
    setDragged((d) => ({ ...d, idx: overIdx }));
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!currentQ || target.length !== (currentQ.options?.length || 0)) return;

    // Demo response data
    const demoResponse = {
      score: 100,
      message: "You scored 4 out of 4 points.",
      userAnswer: target.map((item) => item.text),
      correctAnswer: currentQ.options,
    };

    setResult(demoResponse);
    setShowResultModal(true);
  };

  // Restart handler
  const handleRestart = () => {
    if (!currentQ) return;
    const optionsArr = currentQ.options || [];
    const shuffled = shuffle(
      optionsArr.map((text, i) => ({
        label: String.fromCharCode(97 + i).toUpperCase(),
        text,
        idx: i,
      }))
    );
    setSource(shuffled);
    setTarget([]);
    setTimeLeft(RECORD_SECONDS);
    setTimerStarted(false);
    setShowResultModal(false);
  };

  // Pagination controls
  const renderPagination = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end w-max">
      <div className="relative">
        <button
          className="rounded border bg-white px-4 py-2 shadow text-[#810000] font-bold flex items-center gap-2"
          onClick={() => setDropdownOpen((o) => !o)}
        >
          {String(currentIdx + 1).padStart(3, "0")}
          {dropdownOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 bottom-11 w-36 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50 dropdown-scroll">
            {questions.map((q, i) => (
              <button
                key={q._id}
                onClick={() => {
                  router.push(`/question/reorder-paragraphs/${q._id}`);
                  setDropdownOpen(false);
                }}
                className={`flex w-full px-4 py-2 text-left text-sm font-semibold transition
                  ${
                    i === currentIdx
                      ? "bg-[#810000] text-white"
                      : "hover:bg-[#f5eaea] text-[#810000]"
                  }
                `}
              >
                {String(i + 1).padStart(3, "0")}{" "}
                {q.heading && (
                  <span className="ml-1 truncate w-24">{q.heading}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex mt-2 gap-2">
        <button
          aria-label="Prev"
          onClick={() => {
            if (currentIdx > 0) {
              router.push(
                `/question/reorder-paragraphs/${questions[currentIdx - 1]._id}`
              );
            }
          }}
          disabled={currentIdx === 0}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          aria-label="Next"
          onClick={() => {
            if (currentIdx < questions.length - 1) {
              router.push(
                `/question/reorder-paragraphs/${questions[currentIdx + 1]._id}`
              );
            }
          }}
          disabled={currentIdx === questions.length - 1}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <style jsx>{`
        .dropdown-scroll::-webkit-scrollbar {
          width: 4px;
          background: #eee;
        }
        .dropdown-scroll::-webkit-scrollbar-thumb {
          background: #dedede;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );

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

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Re-order Paragraphs
      </div>
      <p className="text-gray-700 mb-6">{currentQ.prompt}</p>

      {/* Question Heading */}
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded px-4 py-2 font-bold text-white bg-[#810000] text-base tracking-wide">
          #{currentQ._id}
        </span>
        <span className="text-lg font-semibold text-[#810000]">
          {currentQ.heading || ""}
        </span>
      </div>

      {/* Timer */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-[#810000] font-medium text-base">
          Remaining Time:{" "}
          <span className="font-bold">00: {formatTime(timeLeft)} sec</span>
        </span>
      </div>

      {/* Drag-drop panels */}
      <div className="flex flex-col md:flex-row gap-4 w-full justify-center mb-5">
        {/* Source */}
        <div className="flex-1 min-w-[260px] max-w-[50%]">
          <div className="bg-[#810000] text-white text-center rounded-t px-2 py-2 font-semibold">
            Source
          </div>
          <div
            className="border border-[#810000] border-t-0 rounded-b min-h-[320px] pb-2 pt-2 bg-white flex flex-col gap-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropSource}
          >
            {source.length === 0 && (
              <div className="text-center text-gray-400 py-10">
                No items left
              </div>
            )}
            {source.map((item, i) => (
              <div
                key={item.label + item.idx}
                className="flex items-center gap-3 bg-[#faf9f9] border border-[#810000] rounded px-4 py-3 cursor-grab select-none shadow-sm"
                draggable
                onDragStart={() => handleDragStart(item, true, i)}
                style={{
                  opacity:
                    dragged &&
                    dragged.label === item.label &&
                    dragged.fromSource
                      ? 0.4
                      : 1,
                }}
              >
                <span className="w-7 h-7 flex items-center justify-center rounded-full border border-[#810000] bg-white text-[#810000] font-bold">
                  {item.label}
                </span>
                <span className="flex-1 text-gray-800">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center px-1 py-1">
          <span className="text-[#810000] text-3xl font-bold">{">>"}</span>
        </div>

        {/* Target */}
        <div className="flex-1 min-w-[260px] max-w-[50%]">
          <div className="bg-[#810000] text-white text-center rounded-t px-2 py-2 font-semibold">
            Target
          </div>
          <div
            className="border border-[#810000] border-t-0 rounded-b min-h-[320px] pb-2 pt-2 bg-white flex flex-col gap-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropTarget}
          >
            {target.length === 0 && (
              <div className="text-center text-gray-400 py-10">
                Drag paragraphs here
              </div>
            )}
            {target.map((item, i) => (
              <div
                key={item.label + item.idx}
                className="flex items-center gap-3 bg-[#faf9f9] border border-[#810000] rounded px-4 py-3 cursor-grab select-none shadow-sm"
                draggable
                onDragStart={() => handleDragStart(item, false, i)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOverTarget(i);
                }}
                style={{
                  opacity:
                    dragged &&
                    dragged.label === item.label &&
                    !dragged.fromSource
                      ? 0.4
                      : 1,
                }}
              >
                <span className="w-7 h-7 flex items-center justify-center rounded-full border border-[#810000] bg-white text-[#810000] font-bold">
                  {item.label}
                </span>
                <span className="flex-1 text-gray-800">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center mb-2 mt-3">
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-base"
          onClick={handleRestart}
          disabled={timeLeft === 0}
        >
          Restart
        </button>
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border-2 border-[#810000] bg-white text-[#810000] font-semibold text-base hover:bg-[#810000] hover:text-white transition"
          onClick={handleSubmit}
          disabled={
            target.length !== (currentQ.options?.length || 0) || timeLeft === 0
          }
        >
          Submit
        </button>
      </div>

      {/* Result Modal (without black background) */}
      <ResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={result}
      />

      {renderPagination()}
    </div>
  );
}
