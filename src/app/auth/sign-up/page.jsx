"use client";

import React, { useState } from 'react';
import { PiEyeClosedBold, PiEyeClosedDuotone } from "react-icons/pi";
import bg from '../../../../public/pana.png';
import Image from 'next/image';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from "next/navigation";
import 'react-toastify/dist/ReactToastify.css';

const SignUp = () => {
  const baseUrl = process.env.NEXT_PUBLIC_URL;
    const router = useRouter();
const [isEyeOpen, setIsEyeOpen] = useState(false);
const [isEyeOpend, setIsEyeOpend] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Password confirmation logic
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Prepare only the required fields
    const { name, email, password } = formData;

    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }), // ✅ Only sending required data
      });

      const data = await response.json();
      if (response) {
  setFormData({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  
}

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      toast.success('Signup successful!');
      
      // Optional: redirect after success
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
    router.push("/auth/login")
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='md:flex md:flex-row grid gap-10 md:gap-20 mx-10 md:mx-20 mt-10'>
        <div className='md:w-1/2 flex md:mt-20 justify-center items-center md:h-80'>
          <Image className='md:mt-40 md:ml-20' height={400} width={400} src={bg} alt='' />
        </div>
        <div className='flex flex-col gap-5  md:w-1/2 justify-center items-start md:border-l-2 md:border-l-red-800 md:pl-10'>
          <h1 className='font-bold text-4xl'>Sign Up</h1>

          <label>User Name</label>
          <input
            name="name"
            type="text"
            className='border border-slate-300 rounded-2xl p-5 md:w-2/3'
            placeholder='Enter your name'
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            name="email"
            type="email"
            className='border border-slate-300 rounded-2xl p-5 md:w-2/3'
            placeholder='Enter your email '
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
         <div className="w-full relative">
           <input
            name="password"
            type={isEyeOpen ? "text" : "password"}
            className='border border-slate-300 rounded-2xl p-5 md:w-2/3'
            placeholder="Enter a new password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {isEyeOpen ? (
                  <PiEyeClosedBold
                    className="absolute top-6 right-20 md:right-70 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpen(false)}
                  />
                ) : (
                  <PiEyeClosedDuotone
                    className="absolute top-6 right-20  md:right-70 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpen(true)}
                  />
                )}
         </div>

          <label>Confirm Password</label>
          <div className="w-full relative">
            <input
            name="confirmPassword"
            type={isEyeOpend ? "text" : "password"}
            className='border border-slate-300 rounded-2xl p-5 md:w-2/3'
            placeholder='Re-enter your password'
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {isEyeOpend ? (
                  <PiEyeClosedBold
                    className="absolute top-6 right-20 md:right-70 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpend(false)}
                  />
                ) : (
                  <PiEyeClosedDuotone
                    className="absolute top-6 right-20  md:right-70 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpend(true)}
                  />
                )}
          </div>

          <button
            type="submit"
            className='[background-image:linear-gradient(to_right,#D80000,#720000)] text-white md:w-2/3 p-4 rounded-full font-medium text-xl'
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>

          <div className='w-full '>
            <p className='flex flex-col md:flex-row gap-2 '>
              Already have an account?
              <Link className='text-red-800' href={"/auth/login"}>Sign In</Link>
            </p>
          </div>
        </div>
      </form>

      {/* Toast notifications */}
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default SignUp;
