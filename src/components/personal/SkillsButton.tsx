"use client";
import React from "react";
import { FaChevronDown } from "react-icons/fa";


export default function SkillsButton({isOpen, setIsOpen}: {isOpen: boolean, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>}) {
    
    
  return (
    <div>
      <button onClick={()=>{setIsOpen(!isOpen)}} className="text-[20px] cursor-pointer font-[400] text-gray-900 flex items-center gap-2">
        Practice <FaChevronDown />
      </button>
      
    </div>
  );
}
