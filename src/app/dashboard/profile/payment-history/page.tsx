import React from "react";
import empty from '../../../../../public/emty.png'
import Image from "next/image";
const PaymentHistory = () => {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <tr className="bg-gradient-to-r from-[#7D0000] to-[#973333] text-white flex gap-2 md:gap-18 md:px-10 p-2 mt-1 text-left">
            <th>SI. No.</th>
            <th>Transaction ID</th>
            <th>Transaction Date</th>
            <th>Payment Status</th>
            <th>Amount</th>
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
