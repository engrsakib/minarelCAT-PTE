"use client";
import React, { useRef, useState, useEffect } from "react";
import fetchWithAuth from "../../../lib/fetchWithAuth";
import Image from "next/image";
import frame from "../../../../public/frame.png";
import dummy from "../../../../public/dummy-image.png";
import edit from "../../../../public/edit.png";
import UserForm from "../../../components/personal/UserForm";

const Profile = () => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log("Fetching:", `${baseUrl}/user/user-info`);
        const response = await fetchWithAuth(`${baseUrl}/user/user-info`);

        console.log("response", response);

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

  const [preview, setPreview] = useState(dummy);

  useEffect(() => {
    if (userData?.user?.image) {
      setPreview(userData.user.image);
    }
  }, [userData]);

  if (loading) return <p>Loading...</p>;
  if (!userData) return <p>No user data available</p>;
  

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      console.log("profile pic url : ",URL.createObjectURL(file));
      
      // TODO: Upload to API or server here if needed
    }
  };

  return (
    <div>
      <div className="grid">
        <div className="block md:hidden rounded-full top-45 left-6 mt-10">
          <div
            className="user-image relative w-[140px] h-[140px] rounded-full shadow-lg border-2 border-pink-50"
            onClick={handleImageClick}
          >
            <Image
              className="rounded-full object-cover"
              src={preview}
              alt="User Image"
              fill
            />
            <div className="absolute top-25 left-22">
              <Image src={edit} alt="Edit Icon" width={40} height={40} />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="user-name absolute md:left-40 md:top-20 w-100 grid gap-2">
            <h1 className="text-[#7D0000] font-semibold text-4xl">
              {userData.user?.name}
            </h1>
            <h1 className="text-black">{userData.user?._id}</h1>
          </div>
        </div>

        <div className="hidden md:block relative w-full h-full"  onClick={handleImageClick}>
          <Image src={frame} alt="" />
          <div className="absolute rounded-full top-45 left-6 flex">
            <div className="user-image relative w-[140px] h-[140px] rounded-full shadow-lg border-2 border-pink-50">
              <Image
                className="rounded-full object-cover"
                src={ preview}
                alt="User Image"
                fill
              />
              <div className="absolute top-25 left-22">
                <Image src={edit} alt="Edit Icon" width={40} height={40} />
              </div>
                <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
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
          <UserForm data={userData.user} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
