"use client";
import React from "react";
import { FaChevronDown } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';// আ

export default function SkillsButton({isOpen, setIsOpen,disabled}: {isOpen: boolean,disabled:boolean, setIsOpen: React.Dispatch<React.SetStateAction<boolean>>}) {
    
     const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent the default action of the link
    toast.info('Please upgrade your subscription to access the mock test!');
  };
  return (
    <div>
      <button disabled={disabled} onClick={(e) => {
          if (disabled) {
            handleClick(e); // Trigger the toast if the button is disabled
          } else {
            setIsOpen(!isOpen); // Toggle the dropdown if not disabled
          }
        }}  className="text-[20px] cursor-pointer font-[400] text-gray-900 flex items-center gap-2">
        Practice <FaChevronDown />
      </button>
      <ToastContainer />
      
    </div>
  );
}
