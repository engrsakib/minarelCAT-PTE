import React from 'react'
 import bg from '../../../../public/pana.png'
import Image from 'next/image'
import Link from 'next/link'
const SignUp = () => {
  return (
    <div className='md:flex md:flex-row grid gap-10 md:gap-20 mx-10 md:mx-20 mt-10'>
    <div className='md:w-1/2 flex md:mt-20 justify-center items-center md:h-80'>
      <Image className='md:mt-20' height={400} width={400} src={bg}  alt=''/>
    </div>
    <div className='flex flex-col gap-5  md:w-1/2 justify-center items-start md:border-l-2 md:border-l-red-800 md:pl-10'>
        <h1 className='font-bold text-4xl'>Sign Up</h1>
        <label htmlFor="">User Name</label>
        <input type="text" className='border border-slate-300 rounded-2xl p-5 md:w-2/3 ' placeholder='Enter your name' />
        <label htmlFor="" >Email</label>
        <input type="email"  className='border border-slate-300 rounded-2xl p-5 md:w-2/3 '  placeholder='Enter your email '/>
        <label htmlFor="" >Password</label>
        <input type="password" className='border border-slate-300 rounded-2xl p-5 md:w-2/3 '  placeholder="Enter a new password"/>
        <label htmlFor="">Password</label>
        <input type="password"  className='border border-slate-300 rounded-2xl p-5 md:w-2/3 ' placeholder='Re-enter your password'/>
        <button className='[background-image:linear-gradient(to_right,#D80000,#720000)] text-white  md:w-2/3 p-4 rounded-full font-medium text-xl'>Sign Up</button>
        <div className='w-full'>
          <p className='flex flex-col md:flex-row gap-2 '>Already have an account?<Link className='text-red-800' href={"/auth/login"}>Sign In</Link> </p>
        </div>
    </div>
    </div>
  )
}

export default SignUp
