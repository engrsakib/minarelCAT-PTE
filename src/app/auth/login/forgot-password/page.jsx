"use client";
import { useState, FormEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Something went wrong.");
      }
      if (res.ok) {
        router.push(`/auth/login/otp?email=${email}`);
      }

      toast.success(data?.message || "Password reset link sent successfully!");
      setEmail("");
    } catch (err) {
      toast.error(err.message || "Failed to send password reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen mt-20 mx-5">
      <ToastContainer position="top-center" autoClose={4000} />
      <div className="w-full max-w-md bg-white border-2 border-[#7D0000] rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-[#7D0000]">Forgot Password</h1>
        <p className="text-center text-gray-600 text-sm">
          Enter your email address below and we’ll send you a link to reset your password.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 bg-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D80000] transition duration-200"
            placeholder="Enter your Email"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#D80000] to-[#720000] py-3 rounded-full text-white font-semibold transition duration-300 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center">
          <a href="/auth/login" className="text-[#7D0000] underline text-sm hover:text-[#500000]">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
