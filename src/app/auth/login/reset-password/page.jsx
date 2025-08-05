"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.newPassword.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  if (formData.newPassword !== formData.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  const token = localStorage.getItem("resetToken");
   console.log("token",token);
   
  if (!token) {
    toast.error("Reset token missing. Please verify OTP again.");
    return;
  }

  try {
  const res = await fetch(`${baseUrl}/user/reset-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-reset-token": token, // ✅ set token in custom header
    },
    body: JSON.stringify({
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    }),
  });

    const data = await res.json();

    if (res.ok) {
      toast.success("Password reset successfully!");
      localStorage.removeItem("resetToken"); // cleanup
      setTimeout(() => router.push("/auth/login"), 1500);
    } else {
      toast.error(data?.message || "Failed to reset password");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full space-y-6"
      >
        <h2 className="text-2xl font-semibold text-[#7D0000] text-center">
          Reset Password
        </h2>

        <div>
          <label htmlFor="newPassword" className="block mb-2 font-medium">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            id="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7D0000]"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-2 font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7D0000]"
            placeholder="Confirm new password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#7D0000] text-white py-2 rounded-md hover:bg-[#5e0000] transition"
        >
          Reset Password
        </button>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ResetPassword;
