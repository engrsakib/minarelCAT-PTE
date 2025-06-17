// "use client" directive ensures the component is rendered on the client side
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push("/auth/login"); // Redirect to login if not authenticated
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  return { isAuthenticated, loading };
};

export default useAuth;
