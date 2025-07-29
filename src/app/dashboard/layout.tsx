"use client"
import React,{useState,useEffect} from 'react'
import Image from 'next/image';
import icon from '../../../public/profile-icon.png'
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname(); 
  const lastSegment = pathname.split("/").filter(Boolean).pop();
   
   const [bar,setBar] = useState(false);
   const [name,setName] = useState("Profile");
   
  useEffect(() => {
    const nameMap: Record<string, string> = {
      "my-profile": "Profile",
      "plan-info": "Plan Info",
      "payment-history": "Payment History",
      "notifications": "Notification",
    };

    if (lastSegment && nameMap[lastSegment]) {
      setName(nameMap[lastSegment]);
    } else {
      setName("Profile"); // Default fallback
    }
  }, [lastSegment]);

  // const [textSize,setTextSize] = useState("text-3xl");

  //  if(name=="Payment History"){
  //   setTextSize("text-xl md:text-3xl");
  //  }
    
  return (
    <div className='mx-10  md:mx-80 mt-5 md:mt-15'>
        <div >
           <div className='flex relative mt-10 gap-2 mb-2' onClick={()=>setBar(!bar)}>
            <Image src={icon} alt=''/>
           <h1 className={`text-[#D80000] font-medium text-3xl`}>{name}</h1>
           <div className={`${bar===false?"hidden":"block" } md:hidden grid gap-5 bg-white shadow-2xl border-2 border-[#EF0000] w-full absolute top-10 z-20 p-5 rounded`}>
             <Link className={`${lastSegment === "my-profile" ? "text-[#EF0000]" : ""}`} href="/dashboard/profile/my-profile">My Profile</Link> 
               <Link className={`${lastSegment === "plan-info" ? "text-[#EF0000]" : ""}`} href="/dashboard/profile/plan-info">Plan Info</Link> 
               <Link className={`${lastSegment === "payment-history" ? "text-[#EF0000]" : ""}`} href="/dashboard/profile/payment-history">Payment History</Link>
               <Link className={`${lastSegment === "notifications" ? "text-[#EF0000]" : ""}`} href="/dashboard/profile/notifications">Notification   </Link> 
           </div>
           <div className='flex items-center justify-center md:hidden'>
            
            {
              (bar? <IoIosArrowDown size={32}/>:<MdKeyboardArrowRight size={32}/>
)
            }


           </div>
           </div>
           <div className='border-b-3 border-b-[#D80000]'>

           </div>
        </div>
        <div className='flex'>
            <div className=' hidden md:grid gap-8 p-10 pt-6 text-2xl font-medium w-90 max-h-80'>
               <Link className={`${lastSegment === "my-profile" ? "text-[#EF0000]" : ""}`} href="/dashboard/profile/my-profile">My Profile</Link> 
               <Link className={`${lastSegment === "plan-info" ? "text-[#EF0000]" : ""}`} href="/dashboard/profile/plan-info">Plan Info</Link> 
               <Link className={`${lastSegment === "payment-history" ? "text-[#EF0000]" : ""}`} href="/dashboard/profile/payment-history">Payment History</Link>
               <Link className={`${lastSegment === "notifications" ? "text-[#EF0000]" : ""}`} href="/dashboard/profile/notifications">Notification   </Link> 
                
               <button className='flex justify-start'>Log Out</button>
            </div>
            {children}
        </div> 
    </div>
  )
}

export default Layout