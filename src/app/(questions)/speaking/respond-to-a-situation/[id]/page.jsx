"use client";
import { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import MicRecorder from "mic-recorder-to-mp3";

// Constants
const RECORD_SECONDS = 40; // Answer time

export default function RepeatSentencePage({ params }) {
  const { id } = params;
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  // State
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Timers
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const timerRef = useRef();

  // Audio player
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef();

  // MicRecorder instance
  const recorder = useRef(null);

  // Recorder initialization
  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 });
  }, []);

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
      setTimeLeft(RECORD_SECONDS);
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

  // Audio play handler
  const handleAudioPlay = () => {
    setAudioPlaying(true);
  };

  const handleAudioEnded = () => {
    setAudioPlaying(false);
  };

  // Start recording handler
  const handleStartRecording = async () => {
    try {
      if (!recorder.current) {
        recorder.current = new MicRecorder({ bitRate: 128 });
      }
      await recorder.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setTimeLeft(RECORD_SECONDS);
    } catch (e) {
      alert("Microphone access denied or not supported.");
      setIsRecording(false);
    }
  };

  // Stop recording function
  const stopRecording = async () => {
    if (recorder.current) {
      try {
        const [buffer, blob] = await recorder.current.stop().getMp3();
        setAudioBlob(blob);
        setIsRecording(false);
      } catch {
        setAudioBlob(null);
        setIsRecording(false);
      }
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!audioBlob || !question) return;

    setSubmitLoading(true); // Start loading

    const formData = new FormData();
    formData.append("voice", audioBlob, "voice.mp3");
    formData.append("questionId", question._id);
    formData.append("accent", "us");

    try {
      const response = await fetchWithAuth(
        `${baseUrl}/test/speaking/respond-to-a-situation/result`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setResult(data);
      setShowModal(true);
    } catch (e) {
      alert("Something went wrong! Try again.");
    } finally {
      setSubmitLoading(false); // End loading
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
        Listen to and read a description of a situation. You will have 40
        seconds to answer the question. <br />
        Please answer as completely as you can.
      </p>

      {/* Audio Player */}
      <div className="border border-[#810000] rounded p-4 mb-4 bg-[#faf9f9] flex flex-col items-center">
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
            disabled={!audioBlob || submitLoading}
          >
            <span>{submitLoading ? "Submitting..." : "Submit"}</span>
          </button>
          <button
            className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
            onClick={handleStartRecording}
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

      {/* Result Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-[#810000] mb-4 text-center">
              Test Results
            </h2>

            {result?.success ? (
              <div className="space-y-4">
                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Speaking Score
                    </p>
                    <p className="text-base">{result.data.speakingScore}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Reading Score
                    </p>
                    <p className="text-base">{result.data.readingScore}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Content
                    </p>
                    <p className="text-base">{result.data.content}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Fluency
                    </p>
                    <p className="text-base">{result.data.fluency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Pronunciation
                    </p>
                    <p className="text-base">{result.data.pronunciation}</p>
                  </div>
                </div>

                {/* Word Analysis */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Word Analysis
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Good Words
                      </p>
                      <p className="text-base">{result.data.goodWords}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Average Words
                      </p>
                      <p className="text-base">{result.data.averageWords}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Bad Words
                      </p>
                      <p className="text-base">{result.data.badWords}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-red-600 text-center mt-4">
                Error loading results. Please try again.
              </p>
            )}

            {/* Close button */}
            <div className="mt-6 text-center">
              <button
                className="px-6 py-2 bg-[#810000] text-white rounded-full hover:bg-[#5d0000] transition-all"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
}