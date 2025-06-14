import React from "react";
import anik from "@/../public/anik.png";
import tick from "@/../public/Tick.png"; // Assuming you have a tick image in the public folder
import Image from "next/image";
import { Button } from "../ui/button";

export default function Banner() {
  return (
    <div className="max-w-[1440px] mx-auto w-full h-[580px] p-4 bg-gradient-to-r from-[#D80000] to-[#590000] rounded-lg shadow-lg shadow-black/50 flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full items-center">
        
        {/* Image Section */}
        <div className="order-2 md:order-1 flex justify-center md:justify-end items-center p-4">
          <Image
            src={anik}
            alt="PTE Banner Image (Anik Bhai)"
            width={320}
            height={384}
            className="w-[220px] h-auto md:w-[320px] md:h-[384px] lg:w-[476px] lg:h-[571px] object-contain"
            priority
          />
        </div>
        
        {/* Text Section */}
        <div className="order-1 md:order-2 flex flex-col justify-center items-center md:items-start p-4">
          <h1 className="text-white text-[32px] md:text-[44px] font-[400] italic text-center md:text-left leading-tight">
            PTE Success Starts Here!<br className="hidden md:block" />
            Practice, Improve &amp; Score Higher!
          </h1>
          <div>
            <Button className="w-[436px] h-[96px] bg-white mt-[144px] hover:bg-gray-200 text-black text-[24px] font-bold flex items-center justify-center">
              {/* Replace 'anik' with your tick image import or a valid image URL */}
              <Image src={tick} alt="tick" width={50} height={50} /> <span className="text-[32px] font-[500]">PTE Made Easy!</span>
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
}