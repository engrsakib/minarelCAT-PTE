"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Award,
  FileText,
  CheckCircle,
} from "lucide-react";

const WRITING_SECONDS = 599; // 9:59min
const WORD_LIMIT = 1000;

export default function RepeatSentencePage({ params }) {
  const { id } = params;
  const router = useRouter();

  // State
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Writing timer
  const [writingTime, setWritingTime] = useState(WRITING_SECONDS);
  const [writingStarted, setWritingStarted] = useState(false);
  const timerRef = useRef();

  // Answer state
  const [answer, setAnswer] = useState("");
  const [wordCount, setWordCount] = useState(0);

  // Modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination dropdown (not used but kept for future)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

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
      }
      setLoading(false);
      setWritingTime(WRITING_SECONDS);
      setWritingStarted(false);
      setAnswer("");
      setWordCount(0);
    }
    getQuestion();
    // eslint-disable-next-line
  }, [id]);

  // Writing timer logic
  useEffect(() => {
    if (!writingStarted) return;
    if (writingTime === 0) {
      setWritingStarted(false);
      return;
    }
    timerRef.current = setTimeout(() => setWritingTime((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [writingStarted, writingTime]);

  // Word count
  useEffect(() => {
    const wc = answer.trim() ? answer.trim().split(/\s+/).length : 0;
    setWordCount(wc);
  }, [answer]);

  // Prevent paste in textarea
  const handlePaste = (e) => {
    e.preventDefault();
  };

  // Handle input in textarea
  const handleInput = (e) => {
    if (!writingStarted) setWritingStarted(true);
    let val = e.target.value;
    // Limit word count to WORD_LIMIT
    let words = val.trim() ? val.trim().split(/\s+/) : [];
    if (words.length > WORD_LIMIT) {
      words = words.slice(0, WORD_LIMIT);
      val = words.join(" ") + " ";
    }
    setAnswer(val);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!answer.trim() || !question) return;

    setSubmitting(true);

    try {
      const response = await fetchWithAuth(
        `${baseUrl}/test/writing/write_email/result`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId: id,
            email: answer.trim(), // The email content
            // Add any other required fields based on your API spec
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      const result = await response.json();

      // Set result data and show modal
      setResultData(result);
      setShowResultModal(true);
    } catch (e) {
      alert(e.message || "Something went wrong! Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Close modal and reset
  const closeModal = () => {
    setShowResultModal(false);
    setResultData(null);
    // Optionally reset the form or navigate away
    setAnswer("");
    setWordCount(0);
    setWritingTime(WRITING_SECONDS);
    setWritingStarted(false);
  };

  // mm:ss format for timer
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading || !question) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="w-full lg:w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
        <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
          Respond to a Situation (Writing)
        </div>
        <p className="text-gray-700 mb-6">
          Read a description of a situation. You will have{" "}
          <span className="font-bold">9:59 minutes</span> to write your answer.{" "}
          <br />
          Please answer as completely as you can. (Max {WORD_LIMIT} words)
        </p>
        {/* Question Heading */}
        <div className="bg-[#810000] text-white px-5 py-2 rounded mb-2 text-lg font-semibold tracking-wide flex items-center gap-2">
          <span>#{question._id}</span>
          <span>|</span>
          <span>{question.heading}</span>
        </div>
        {/* Timer */}
        <div className="mb-2 text-[#810000] font-medium text-base flex items-center gap-2">
          <svg
            width="21"
            height="21"
            fill="#810000"
            className="inline"
            viewBox="0 0 24 24"
          >
            <path d="M12 7v5l4 2M12 1a11 11 0 1 1 0 22 11 11 0 0 1 0-22Z" />
          </svg>
          <span className="font-bold text-lg">{formatTime(writingTime)}</span>
        </div>
        {/* Prompt */}
        <div className="border border-[#810000] rounded p-4 mb-4 bg-white text-gray-900 whitespace-pre-line">
          {question.prompt}
        </div>
        {/* Writing Box */}
        <div className="border border-[#810000] rounded p-0 mb-3 bg-[#faf9f9] flex flex-col items-stretch relative">
          <textarea
            className="w-full min-h-[210px] max-h-[420px] p-4 rounded text-base border-0 outline-none resize-none bg-[#faf9f9] text-gray-800 font-mono"
            placeholder="Type your answer here (Paste is disabled)..."
            value={answer}
            onChange={handleInput}
            onPaste={handlePaste}
            maxLength={WORD_LIMIT * 7} // extra limit
            disabled={writingTime === 0 || submitting}
          />
          <div className="flex items-center justify-between px-4 pb-2 pt-1">
            <span className={`text-xs text-gray-500`}>
              {writingTime === 0 ? "Time's up!" : ""}
            </span>
            <span
              className={`text-xs font-semibold transition-all duration-200 ${
                wordCount > WORD_LIMIT
                  ? "text-red-600"
                  : wordCount > WORD_LIMIT - 40
                  ? "text-orange-600"
                  : "text-gray-700"
              }`}
            >
              Words: {wordCount} / {WORD_LIMIT}
            </span>
          </div>
        </div>
        {/* Controls */}
        <div className="flex gap-3 mb-2">
          <button
            className="flex items-center gap-1 px-4 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm disabled:opacity-50"
            onClick={() => {
              setAnswer("");
              setWordCount(0);
              setWritingTime(WRITING_SECONDS);
              setWritingStarted(false);
            }}
            disabled={(writingTime === 0 && !answer) || submitting}
          >
            Restart
          </button>
          <button
            className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
            onClick={handleSubmit}
            disabled={
              !answer.trim() ||
              wordCount > WORD_LIMIT ||
              writingTime === 0 ||
              submitting
            }
          >
            <span>{submitting ? "Submitting..." : "Submit"}</span>
          </button>
        </div>

        <style jsx>{`
          textarea::placeholder {
            color: #bbb;
          }
          textarea:disabled {
            background: #f5f5f5;
            color: #aaa;
          }
        `}</style>
      </div>

      {/* Result Modal */}
      {showResultModal && resultData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Award className="text-[#810000] w-6 h-6" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Writing Assessment Results
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Overall Score */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#810000] to-[#a00000] text-white mb-3">
                  <span className="text-2xl font-bold">{resultData.score}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Total Score out of 20
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Content</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {resultData.content}/5
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Grammar</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {resultData.grammar}/5
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Spelling</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {resultData.spelling}/5
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Form</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {resultData.form}/5
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Organization</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {resultData.organization}/5
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">
                    Email Convention
                  </div>
                  <div className="text-lg font-semibold text-gray-800">
                    {resultData.emailConvention}/5
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                  <div className="text-sm text-gray-600 mb-1">
                    Vocabulary Range
                  </div>
                  <div className="text-lg font-semibold text-gray-800">
                    {resultData.vocabularyRange}/5
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FileText className="text-blue-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">
                      Detailed Feedback
                    </h3>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      {resultData.feedback}
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Your answer has been successfully submitted and evaluated!
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-[#810000] text-white rounded-lg hover:bg-[#5d0000] transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
