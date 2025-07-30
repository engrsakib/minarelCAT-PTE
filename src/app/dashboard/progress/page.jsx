import React from 'react'
import {Progress} from '../../../components/ui/progress'
const ProgressDemo = () => {
  return (
    <div className='w-full md:w-275 border-2 border-[#7D0000] rounded'>
        <div className='bg-[#7D0000] w-full text-white p-2'>
               Practice Progress 
        </div>
        <div className='bg-[#F2E6E6] p-5 py-10 w-full'>
                <div  className='bg-white md:flex justify-between gap-2 rounded-xl p-8 md:p-15 w-full'>
                    <div className='md:border-r-2 grid gap-2 border-r-[#7D0000] pr-2'>
                        <h1 className='flex justify-between pr-4 font-medium text-xl'>150 <span className='bg-amber-400 text-white rounded-full px-2 text'>50%</span></h1>
                        
                            {/* <div className="inner bg-[#F19F20] w-[50%] h-1"></div> */}
                            <Progress value={30} color="amber" />
                        
                        <p>Speaking Questions</p>
                    </div>
                    <div className='md:border-r-2 grid gap-2 border-r-[#7D0000] pr-2'>
                        <h1 className='flex justify-between pr-4 font-medium text-xl'>150  <span className='bg-blue-500 text-white rounded-full px-2 text'>50%</span></h1>
                        <Progress value={30} color="sky" />
                        <p>Writing Questions</p>
                    </div>
                    <div className='md:border-r-2 grid gap-2 border-r-[#7D0000] pr-2'>
                        <h1 className='flex justify-between pr-4 font-medium text-xl'>150 <span className='bg-green-500 text-white rounded-full px-2 text'>50%</span></h1>
                        <Progress value={30} color="green" />
                        <p>Reading Questions</p>
                    </div>
                    <div className='md:border-r-2 grid gap-2 border-r-[#7D0000] pr-2'>
                        <h1 className='flex justify-between pr-4 font-medium text-xl'>150 <span className='bg-blue-500 text-white rounded-full px-2 text'>50%</span></h1>
                        <Progress value={70} color="blue" />
                        <p>Listening Questions</p>
                    </div>
                    <div className='grid gap-2 pr-2'>
                        <h1 className='flex justify-between pr-4 font-medium text-xl'>150 <span className='bg-red-900 text-white rounded-full px-2 text'>50%</span></h1>
                        <Progress value={30} color="red" />
                        <p>Mocktest Questions</p>
                    </div>
                </div>

                {/* View Practice Progress */}
                <div className='grid gap-2 bg-white mt-5 rounded-2xl p-8'>
                    <div>
                        <h1 className='font-medium md:text-3xl text-[#7D0000] border-b-2 border-b-[#7D0000]'>View Practice Progress</h1>
                    </div>
                    <div className=' grid gap-5 md:flex md:gap-5 w-full'>
                        <div className='md:w-1/2 flex flex-col gap-5'>
                            <div className="speaking bg-[#F2E6E6] grid gap-5 rounded-2xl p-5 ">
                                    <h1 className='text-amber-500'>Speaking</h1>
                                    <div className='md:flex justify-between gap-5 text-xs'>
                                        <div className="left w-full flex flex-col gap-2 md:gap-5">
                                            <div className="upper">
                                                <p className='flex justify-between'>Read Aloud <span>100/200</span></p>
                                                <Progress value={30} color="amber" />


                                            </div>
                                            <div className="lower">
                                                <p className='flex justify-between'>Repeat Sentence <span>100/200</span></p>
                                                <Progress value={30} color="amber" />
                                            </div>

                                        </div>
                                        <div className="right w-full flex flex-col gap-2 md:gap-5">
                                            <div className="upper">
                                                <p className='flex justify-between'>Respond to a Situation <span>100/200</span></p>
                                                <Progress value={30} color="amber" />


                                            </div>
                                            <div className="lower">
                                                <p className='flex justify-between'>Answer Short Question <span>100/200</span></p>
                                                <Progress value={30} color="amber" />
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            <div className="reading bg-[#F2E6E6] grid gap-5 rounded-2xl p-5 ">
                                    <h1 className='text-green-500'>Reading</h1>
                                    <div className='md:flex justify-between gap-5 text-xs'>
                                        <div className="left w-full flex flex-col gap-2 md:gap-5">
                                            <div className="upper">
                                                <p className='flex justify-between'>Fill in the Blanks <span>100/200</span></p>
                                                <Progress value={30} color="green" />


                                            </div>
                                            <div className="lower">
                                                <p className='flex justify-between'>Re-order Paragraphs <span>100/200</span></p>
                                                <Progress value={30} color="green" />
                                            </div>

                                        </div>
                                        <div className="right w-full flex flex-col gap-2 md:gap-5">
                                            <div className="upper">
                                                <p className='flex justify-between'>Multiple Choice and answers <span>100/200</span></p>
                                                <Progress value={30} color="green" />


                                            </div>
                                            <div className="lower">
                                                <p className='flex justify-between'>Multiple Choice,Single Answer <span>100/200</span></p>
                                                <Progress value={30} color="green" />
                                            </div>
                                        </div>
                                    </div>
                            </div>
                        </div>
                        <div className='md:w-1/2 flex flex-col gap-5'>
                            <div className="reading bg-[#F2E6E6] grid gap-5 rounded-2xl p-5 ">
                                    <h1 className='text-sky-400'>Writing</h1>
                                    <div className='md:flex justify-between gap-5 text-xs'>
                                        <div className="left w-full flex flex-col gap-2 md:gap-5">
                                            <div className="upper">
                                                <p className='flex justify-between'>Summarize Written Text <span>100/200</span></p>
                                                <Progress value={30} color="sky" />


                                            </div>
                                            

                                        </div>
                                        <div className="right w-full flex flex-col gap-2 md:gap-5">
                                            <div className="upper">
                                                <p className='flex justify-between'>Write Email <span>100/200</span></p>
                                                <Progress value={30} color="sky" />


                                            </div>
                                            
                                        </div>
                                    </div>
                            </div>
                            <div className="speaking bg-[#F2E6E6] grid gap-5 rounded-2xl p-5 ">
                                    <h1 className='text-blue-500'>Listening</h1>
                                    <div className='md:flex justify-between gap-5 text-xs'>
                                        <div className="left w-full flex flex-col gap-2 md:gap-5">
                                            <div className="upper">
                                                <p className='flex justify-between'>Summarize Spoken Text <span>100/200</span></p>
                                                <Progress value={30} color="blue" />


                                            </div>
                                            <div className="lower">
                                                <p className='flex justify-between'>Fill in the blanks <span>100/200</span></p>
                                                <Progress value={30} color="blue" />
                                            </div>

                                        </div>
                                        <div className="right w-full flex flex-col gap-2 md:gap-5">
                                            <div className="upper">
                                                <p className='flex justify-between'>Multiple Choice and answers <span>100/200</span></p>
                                                <Progress value={30} color="blue" />


                                            </div>
                                            <div className="lower">
                                                <p className='flex justify-between'>Multiple Choice,Single Answer <span>100/200</span></p>
                                                <Progress value={30} color="blue" />
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            <div className="reading bg-[#F2E6E6] grid gap-5 rounded-2xl p-5 ">
                                    <h1 className='text-red-900'>Mock Test</h1>
                                    <div className='md:flex justify-between gap-5 text-xs'>
                                        <div className="left w-full flex flex-col gap-2 md:gap-5">
                                            <div className="upper">
                                                <p className='flex justify-between'>Full Mock Test <span>100/200</span></p>
                                                <Progress value={30} color="red" />


                                            </div>
                                            

                                        </div>
                                        <div className="right w-full flex flex-col gap-2 md:gap-5">
                                            <div className="upper">
                                                <p className='flex justify-between'>Sectional Mock Test <span>100/200</span></p>
                                                <Progress value={30} color="red" />


                                            </div>
                                            
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>

    </div>
  )
}

export default ProgressDemo