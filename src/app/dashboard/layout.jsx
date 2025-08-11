"use client";
import React, { useEffect, useState } from "react";
import fetchWithAuth from "../../lib/fetchWithAuth";
import Image from "next/image";
import settingsLogo from "../../../public/settingLogo.png";
const Layout = ({
  children
}) => {

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const response = await fetchWithAuth(`${baseUrl}/user/user-progress`);

        

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
       

        setData(data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (baseUrl) fetchUserData();
  }, [baseUrl]);

  

  return (
    <div>
      {
        loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#810000]"></div>
          </div>
        ) : (
          <div className="mx-10 flex flex-col gap-5 md:mx-55 md:flex md:flex-row md:gap-5 mt-10 md:mt-15">
            <div className="md:w-1/4 flex flex-col gap-5 ">
              <div className="border-2 border-[#7D0000] rounded">
                <p className="bg-[#7D0000] text-white p-2 px-3 flex justify-between font-medium">
                  {" "}
                  Your Target{" "}
                  <button>
                    <Image src={settingsLogo} alt="" />
                  </button>
                </p>
                <p className="bg-[#F2E6E6] h-20 flex items-center justify-center font-medium text-3xl">
                  {data?.userTarget}
                </p>
              </div>

            </div>
            <div className="md:w-3/4">{children}</div>
          </div>
        )
      }
    </div>
  );
};

export default Layout;
