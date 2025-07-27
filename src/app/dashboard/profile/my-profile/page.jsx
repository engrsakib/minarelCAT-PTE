"use client";
import React, { useState, useEffect } from "react";
import fetchWithAuth from "../../../../lib/fetchWithAuth";
import Image from "next/image";
import frame from "../../../../../public/frame.png";
import dummy from "../../../../../public/dummy-image.png";
import edit from "../../../../../public/edit.png";
import UserForm from "../../../../components/personal/UserForm";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log("Fetching:", `${baseUrl}/user/user-info`);
        const response = await fetchWithAuth(`${baseUrl}/user/user-info`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched Data:", data);

        setUserData(data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (baseUrl) fetchUserData();
  }, [baseUrl]);

  if (loading) return <p>Loading...</p>;
  if (!userData) return <p>No user data available</p>;
  console.log('user data: ',userData);
  
  return (
    <div>
      <div className="grid">
        
          
          <div className="block md:hidden rounded-full top-45 left-6 mt-10 ">
            <div className="user-image relative w-[140px] h-[140px] rounded-full shadow-lg border-2 border-pink-50">
              {userData?.user?.image ? (
                <Image
                  className="rounded-full object-cover"
                  src={userData.user.image}
                  alt="User Image"
                  fill
                />
              ) : (
                <Image
                  className="rounded-full object-cover"
                  src={dummy}
                  alt="Default Image"
                  fill
                />
              )}
              <div className="absolute top-25 left-22">
                <Image src={edit} alt="Edit Icon" width={40} height={40} />
              </div>
            </div>

            <div className="user-name absolute md:left-40 md:top-20 w-100 grid gap-2">
              <h1 className="text-[#7D0000] font-semibold text-4xl ">
                {userData.user?.name}
              </h1>
              <h1 className="text-black">{userData.user?._id}</h1>
            </div>
          </div>
        
        <div className="hidden md:block relative w-full h-full">
          <Image src={frame} alt="" />
          <div className="absolute rounded-full top-45 left-6 flex">
            <div className="user-image relative w-[140px] h-[140px] rounded-full shadow-lg border-2 border-pink-50">
              {userData?.user?.image ? (
                <Image
                  className="rounded-full object-cover"
                  src={userData.user.image}
                  alt="User Image"
                  fill
                />
              ) : (
                <Image
                  className="rounded-full object-cover"
                  src={dummy}
                  alt="Default Image"
                  fill
                />
              )}
              <div className="absolute top-25 left-22">
                <Image src={edit} alt="Edit Icon" width={40} height={40} />
              </div>
            </div>

            <div className="user-name absolute left-40 top-20 w-100 grid gap-2">
              <h1 className="text-black font-semibold text-4xl">
                {userData.user?.name}
              </h1>
              <h1 className="text-black">{userData.user?._id}</h1>
            </div>
          </div>
        </div>
        <div className="mt-25">
          <UserForm />
        </div>
      </div>
    </div>
  );
};

export default Profile;
