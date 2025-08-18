import React from "react";
import Logo from "./Logo";
import Link from "next/link";

export default function Footer() {
 
  return (
    <div className="text-[20px] font-normal bg-gradient-to-r from-[#7F0B0B] to-[#590000] px-4 py-8 rounded w-full min-h-[250px] transition-all duration-300">
      <section className="grid grid-cols-1 lg:grid-cols-6 gap-8 mt-10 mb-20 w-full max-w-6xl mx-auto">
        {/* first */}
        <div className="lg:col-span-2 flex flex-col gap-4 items-start text-left">
          <Logo />
          <p className="font-normal text-[14px] capitalize text-white max-w-xs md:max-w-md lg:max-w-none">
            MUPRODEC ENERGY SARL specializes in renewable energy and efficiency
            solutions across West Africa. With 10+ years of expertise, we
            provide high-quality installations, maintenance, and training to
            drive sustainable growth.
          </p>
        </div>

        <div className="md:col-span-4 flex flex-col md:flex-row items-start justify-between gap-8 lg:gap-0">
          <div className="flex flex-col gap-2 items-start">
            <h1 className="text-xl md:text-2xl font-normal text-white">Explore</h1>
            <Link
              href="/"
              className="text-white text-[16px] font-normal hover:text-[#F2F2F2] transition-all duration-300"
            >
              Home
            </Link>
            <Link
              href="/subscription/pricing"
              className="text-white text-[16px] font-normal hover:text-[#F2F2F2] transition-all duration-300"
            >
              Pricing
            </Link>  
            <Link
              href="mailto:hello@skillsnap.com"
              className="text-white text-[16px] font-normal hover:text-[#F2F2F2] transition-all duration-300"
              
            >
              Contact
            </Link>
          </div>

          <div className="flex flex-col gap-2 items-start mt-6  md:mt-0">
            <h1 className="text-xl md:text-2xl font-normal text-white">Unity Pages</h1>
            <Link
              href="/company/about"
              className="text-white text-[16px] font-normal hover:text-[#F2F2F2] transition-all duration-300"
            >
              About Us
            </Link>
            <Link
              href="/company/privacy"
              className="text-white text-[16px] font-normal hover:text-[#F2F2F2] transition-all duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/company/terms"
              className="text-white text-[16px] font-normal hover:text-[#F2F2F2] transition-all duration-300"
            >
              Terms and Conditions
            </Link>
          </div>

          <div className="flex flex-col gap-2 items-start mt-6 md:mt-0">
            <h1 className="text-xl md:text-2xl font-normal text-white">Get in Touch</h1>
            <Link
              href="mailto:Fortunekouka@gmail.com"
              className="text-white text-[16px] font-normal hover:text-[#F2F2F2] transition-all duration-300"
            >
              Fortunekouka@gmail.com
            </Link>
            <Link
              href="tel:00956567890"
              className="text-white text-[16px] font-normal hover:text-[#F2F2F2] transition-all duration-300"
            >
              (009)56567890
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}