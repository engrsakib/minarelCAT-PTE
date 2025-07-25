"use client";
import React from "react";
import fetchWithAuth from "../../../../lib/fetchWithAuth";
import Image from "next/image";
import { useState, useEffect } from "react";
import frame from "../../../../../public/frame.png";
import dummy from "../../../../../public/dummy-image.png";
import edit from "../../../../../public/edit.png";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`${baseUrl}/user/user-info`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setUserData(data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        setLoading(false);

        // Fallback to empty array or show error message
      }
    };

    // Initial fetch
    fetchUserData();
  }, [baseUrl]);
  console.log("user data", userData);

  return (
    <div>
      <div className="">
        <div className="relative">
          <Image src={frame} alt="" />
          <div className="absolute top-25 left-6">
            <div className="user-image relative w-[130px] h-[130px] rounded-full  border-2 border-pink-50">
              {userData?.image ? (
                <Image
                  className="rounded-full object-cover"
                  src={userData.image}
                  alt="User Image"
                  width={130}
                  height={130}
                />
              ) : (
                <Image
                  className="rounded-full object-cover"
                  src={dummy}
                  alt="Default Image"
                  width={130}
                  height={130}
                />
              )}
              <div className="absolute top-20 left-20">
                <Image src={edit} alt="Edit Icon" width={30} height={30} />
              </div>
            </div>

            <div className="user-name"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
