"use client";
import React, { useEffect, useState } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import {

  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AudioPlayer from './../../../../../components/audio/AudioPlayer';
// Audio Player Component (use your previous one if it was custom)


export default function DynamicPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [summary, setSummary] = useState(""); // Textarea value

  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  // Fetch listening questions, support both array and single object
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();

        let arr = [];
        // Handle array: { questions: [...] }
        if (Array.isArray(data?.questions) && data.questions.length > 0) {
          if (data.questions[0]?.question) {
            arr = data.questions.map(q => q.question);
          } else {
            arr = data.questions;
          }
          setQuestions(arr);
          const idx = arr.findIndex((q) => q._id === id);
          setCurrentIdx(idx !== -1 ? idx : 0);
          setCurrentQ(arr[idx !== -1 ? idx : 0]);
        }
        // Handle single: { question: {...} }
        else if (data?.question) {
          setQuestions([data.question]);
          setCurrentQ(data.question);
          setCurrentIdx(0);
        } else {
          setQuestions([]);
          setCurrentQ(null);
          setCurrentIdx(0);
        }
      } catch {
        setQuestions([]);
        setCurrentQ(null);
        setCurrentIdx(0);
      }
      setLoading(false);
      setSummary(""); // reset summary when loading new question
    }
    getQuestions();
    // eslint-disable-next-line
  }, [id]);

  // Pagination
  const goToIndex = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    router.push(`/question/summarize-spoken-text/${questions[idx]._id}`);
    setDropdownOpen(false);
  };

  const renderPagination = () => (
    <div className="pagination-sticky">
      <div className="flex items-center gap-2">
        <button
          aria-label="Prev"
          onClick={() => goToIndex(currentIdx - 1)}
          disabled={currentIdx === 0}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="relative">
          <button
            className="rounded border border-[#810000] bg-white px-4 py-2 shadow text-[#810000] font-bold flex items-center gap-2"
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
            <div className="absolute left-0 bottom-12 w-44 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50 dropdown-scroll">
              {questions.slice(0, 100).map((q, i) => (
                <button
                  key={q._id}
                  onClick={() => goToIndex(i)}
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
        <button
          aria-label="Next"
          onClick={() => goToIndex(currentIdx + 1)}
          disabled={currentIdx === questions.length - 1}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <style jsx>{`
        .pagination-sticky {
          position: fixed;
          right: 2.5rem;
          bottom: 2.5rem;
          z-index: 50;
          background: transparent;
        }
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

  // Submit handler
  const handleSubmit = async () => {
    if (!summary.trim() || !currentQ) return;
    const payload = {
      questionId: currentQ._id,
      summary: summary.trim(),
    };
    try {
      await fetchWithAuth("/test/listening/summarize_spoken_text/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      alert("Your summary has been submitted! (Demo: backend response not shown)");
      setSummary("");
    } catch (e) {
      alert("Something went wrong! Try again.");
    }
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
        Summarize Spoken Text
      </div>
      <p className="text-gray-700 mb-6">
        Listen to the recording. Write a summary. Your summary should be between 50 and 70 words. Include the question ID with your submission.
      </p>
      {/* Question Heading */}
      <div className="bg-[#810000] text-white px-5 py-2 rounded mb-2 text-lg font-semibold tracking-wide flex items-center gap-2">
        <span>#{currentQ._id}</span>
        <span>|</span>
        <span>{currentQ.heading}</span>
      </div>
      {/* Audio Player */}
      <div className="border border-[#810000] rounded p-4 mb-4 bg-white text-gray-900 whitespace-pre-line">
        {/* <AudioPlayer src={currentQ.audioUrl} /> */}
        <AudioPlayer src={currentQ.audioUrl} />
      </div>
      {/* Textarea for summary */}
      <div className="border border-[#810000] rounded p-4 mb-6 bg-[#faf9f9] flex flex-col items-start">
        <label htmlFor="summary" className="text-[#810000] font-semibold mb-2">
          Write your summary here (include ID automatically)
        </label>
        <textarea
          id="summary"
          rows={7}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3 font-mono text-base"
          placeholder={`Example: [${currentQ._id}] ...your summary here...`}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <button
          className="px-5 py-2 rounded border-2 border-[#810000] bg-white text-[#810000] font-semibold text-base hover:bg-[#810000] hover:text-white transition"
          onClick={handleSubmit}
          disabled={!summary.trim()}
        >
          Submit
        </button>
      </div>
      {renderPagination()}
    </div>
  );
}