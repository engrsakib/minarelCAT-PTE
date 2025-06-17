// "use client" directive ensures the component is rendered on the client side
"use client";

import useAuth from "@/components/Reusable/protectRoute";



const ProtectedPage = () => {
    const { isAuthenticated, loading } = useAuth();

    if(loading) {
        return <div>Loading...</div>;}
    
        if (!isAuthenticated) {
        return }

  return (
    <div>
      <h1>Protected Page</h1>
    </div>
  );
};

export default ProtectedPage;
