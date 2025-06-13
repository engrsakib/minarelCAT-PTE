"use client";
import React from 'react'
import LogoImage from "@/../public/logo.png";
import Image from "next/image";

export default function Logo() {
  return (
    <div>
      <Image
            src={LogoImage}
            alt="MineralCat Logo"
            className='w-[226px] max-sm:w-[180px] max-sm:h-auto  rounded-full h-[65px] object-cover'
            width={226}
            height={65}
            />
    </div>
  )
}
