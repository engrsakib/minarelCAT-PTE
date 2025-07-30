"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import settingsLogo from "../../../public/settingLogo.png";
const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (targetDate) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;

        if (distance < 0) {
          clearInterval(interval);
          setRemainingTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
          setRemainingTime({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((distance / (1000 * 60)) % 60),
            seconds: Math.floor((distance / 1000) % 60),
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [targetDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = new Date(e.target.value);
    if (!isNaN(selected.getTime())) {
      setTargetDate(selected);
      setShowModal(false);
    }
  };

  return (
    <div className="mx-10 flex flex-col gap-5 md:mx-55 md:flex md:flex-row md:gap-5 mt-10 md:mt-15">
      <div className="md:w-1/4 flex flex-col gap-5 ">
        <div className="border-2 border-[#7D0000] rounded">
          <p className="bg-[#7D0000] text-white p-2 px-3 flex justify-between font-medium">
            {" "}
            Your Target{" "}
            <button>
              <Image src={settingsLogo} alt="" />
            </button>
          </p>
          <p className="bg-[#F2E6E6] h-20 flex items-center justify-center font-medium text-3xl">
            50+
          </p>
        </div>
        <div className="border-2 border-[#7D0000] rounded w-80 md:w-90 ">
          <p className="bg-[#7D0000] text-white p-2 px-3 flex justify-between font-medium items-center">
            Exam Countdown
            <button onClick={() => setShowModal(true)}>
              <Image src={settingsLogo} alt="Settings" width={20} height={20} />
            </button>
          </p>

          <div className="bg-[#F2E6E6] p-3 flex gap-8 text-center justify-center items-center text-xl font-semibold h-25">
            <p>
              {remainingTime.days}{" "}
              <span className="block text-sm font-normal">Days</span>
            </p>
            <p>
              {remainingTime.hours}{" "}
              <span className="block text-sm font-normal">Hours</span>
            </p>
            <p>
              {remainingTime.minutes}{" "}
              <span className="block text-sm font-normal">Minutes</span>
            </p>
            <p>
              {remainingTime.seconds}{" "}
              <span className="block text-sm font-normal">Seconds</span>
            </p>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0  bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-xl text-black">
                <h2 className="text-lg font-bold mb-4">
                  Select Target Date and Time
                </h2>
                <input
                  type="datetime-local"
                  onChange={handleDateChange}
                  className="border border-gray-300 rounded px-2 py-1"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-red-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="md:w-3/4">{children}</div>
    </div>
  );
};

export default Layout;
