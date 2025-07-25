import React from 'react'
import Image from 'next/image';
import icon from '../../../public/profile-icon.png'
import Link from 'next/link';

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
    
  return (
    <div className='mx-80 mt-15'>
        <div >
           <div className='flex gap-2 mb-2'>
            <Image src={icon} alt=''/>
           <h1 className='text-[#D80000] font-medium text-3xl'>Profile</h1>
           </div>
           <div className='border-b-3 border-b-[#D80000]'>

           </div>
        </div>
        <div className='flex'>
            <div className='grid gap-8 p-10 pt-6 text-2xl font-medium w-90'>
               <Link className='text-[#EF0000]' href="">My Profile</Link> 
               <Link className='' href="">Plan Info</Link> 
               <Link href="">Notification   </Link> 
               <Link href="">My Profile</Link> 
               <button className='flex justify-start'>Log Out</button>
            </div>
            {children}
        </div> 
    </div>
  )
}

export default layout