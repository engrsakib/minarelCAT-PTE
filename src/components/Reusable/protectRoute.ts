// Example of using useEffect for client-side redirection
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const useAuthProtection = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken'); // LocalStorage থেকে টোকেন চেক

    if (!token) {
      router.push('/auth/login'); // যদি টোকেন না থাকে তবে লগইন পেজে রিডাইরেক্ট
    }
  }, [router]);
};
