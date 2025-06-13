import React from "react";
import Logo from "./Logo";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="text-[20px] font-[400] bg-gradient-to-r from-[#7F0B0B] to-[#590000] p-8 text-white px-4 py-2 rounded w-full min-h-[250px]  hover:transition-all duration-300">
      <section className="grid grid-cols-6 gap-4 mt-[65px] mb-[183px] w-[80%] mx-auto">
        {/* first */}
        <div className="col-span-2 flex flex-col gap-4">
          <Logo />
          <p className="font-[400] text-[14px] capitalize text-white">
            MUPRODEC ENERGY SARL specializes in renewable energy and efficiency
            solutions across West Africa. With 10+ years of expertise, we
            provide high-quality installations, maintenance, and training to
            drive sustainable growth.
          </p>
        </div>

        <div className="col-span-4 flex flex-col lg:flex-row items-center justify-around gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-[400] text-white">Explore</h1>
            <Link
              href="/"
              className=" text-white text-[16px] font-[400] hover:text-[#F2F2F2] transition-all duration-300"
            >
              Home{" "}
            </Link>
            <Link
              href="/"
              className=" text-white text-[16px] font-[400] hover:text-[#F2F2F2] transition-all duration-300"
            >
              Product{" "}
            </Link>
            <Link
              href="/"
              className=" text-white text-[16px] font-[400] hover:text-[#F2F2F2] transition-all duration-300"
            >
              Blogs{" "}
            </Link>
            <Link
              href="/"
              className=" text-white text-[16px] font-[400] hover:text-[#F2F2F2] transition-all duration-300"
            >
              Contact{" "}
            </Link>
            
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-[400] text-white">Unity Pages</h1>
            <Link
              href="/"
              className=" text-white text-[16px] font-[400] hover:text-[#F2F2F2] transition-all duration-300"
            >
              About Us{" "}
            </Link>
            <Link
              href="/"
              className=" text-white text-[16px] font-[400] hover:text-[#F2F2F2] transition-all duration-300"
            >
              Privecy Policy{" "}
            </Link>
            <Link
              href="/"
              className=" text-white text-[16px] font-[400] hover:text-[#F2F2F2] transition-all duration-300"
            >
              Terms and Conditions{" "}
            </Link>
            
            
          </div>
        </div>
      </section>
    </div>
  );
}
