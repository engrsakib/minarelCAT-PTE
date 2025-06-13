import React from 'react'

export default function Title({heading, subheading, pragraph}: {heading: string, subheading: string, pragraph: string}) {
  return (
    <div>
      
        <h1 className="text-[64px] text-[#7D0000] font-bold text-center">{heading}</h1>
        <h2 className="text-[64px] text-center text-black mt-0.5">{subheading}</h2>
        <p className="text-center text-[32px] text-gray-500 mt-0.5">{pragraph}</p>

    </div>
  )
}
