import React from "react";
import empty from '../../../../../public/emty.png'
import Image from "next/image";
const PaymentHistory = () => {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <tr className="bg-gradient-to-r from-[#7D0000] to-[#973333] text-white flex p-2  md:gap-18 md:px-10  mt-2 text-left ">
            <th className=" border-r-1 border-white md:border-none">SI. No.</th>
            <th className=" border-r-1 border-white md:border-none">Transaction ID</th>
            <th className=" border-r-1 border-white md:border-none">Transaction Date</th>
            <th className=" border-r-1 border-white md:border-none">Payment Status</th>
            <th className="  md:border-none">Amount</th>
          </tr>
          
        
          
        </table>
      </div>
      <div className="grid items-center justify-center  ">
            <Image src={empty} alt="" className="w-100 md:w-150"/>
            <h1 className="text-[#7D0000] text-center font-medium text-2xl md:text-5xl">No Transactions Yet</h1>
      </div>
    </div>
  );
};

export default PaymentHistory;
 