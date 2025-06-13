import React from "react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <div className="text-[20px] font-[400] bg-gradient-to-r from-[#7F0B0B] to-[#590000] p-8 text-white px-4 py-2 rounded w-full min-h-[250px]  hover:transition-all duration-300">
      <section className="grid grid-cols-6 gap-4 w-[80%] mx-auto">
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

        <div className="col-span-4 flex flex-col gap-4"></div>
      </section>
    </div>
  );
}
