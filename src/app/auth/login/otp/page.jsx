"use client";
import React, { useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import otpp from "../../../../../public/otp.png";
import Image from "next/image";
import back from "../../../../../public/arrow.png";

const Otp = () => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  
  
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const otpValue = otp.join("");

  if (!email || otpValue.length !== 6) {
    toast.error("Email or OTP is invalid");
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/user/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otpValue }),
    });

    const data = await res.json(); // ✅ Only once

    if (res.ok) {
      toast.success("OTP verified successfully!");

      // ✅ Store token before redirect
      if (data.resetToken) {
        localStorage.setItem("resetToken", data.resetToken);
      }
      
      

      // ✅ Redirect after short delay
      setTimeout(() => router.push("/auth/login/reset-password"), 1500);
    } else {
      toast.error(data?.message || "OTP verification failed");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }
};


  return (
    <div className="md:mt-40 gap-10 md:flex items-center justify-center  px-4">
      <div>
      <Image src={otpp} alt=""/>
      </div>
      <div>
        <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl   w-full text-center space-y-6"
      >
        <h2 className="text-3xl font-semibold  flex items-center justify-start gap-5"><Image onClick={() => router.back()} height={25} src={back} alt=""/>Verify Code</h2>
        <p>Please check your email. We have sent a code to your email</p>

        <div className="flex justify-center gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              ref={(el) => (inputRefs.current[idx] = el)}
              className="w-10 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7D0000]"
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#D80000] to-[#720000] text-white py-4 rounded-full  transition"
        >
          Verify 
        </button>
      </form>
      </div>

      {/* Toast notifications container */}
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

export default Otp;
