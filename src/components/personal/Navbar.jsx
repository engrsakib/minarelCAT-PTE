"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import SkillsButton from "./SkillsButton";
import { FaRightLong } from "react-icons/fa6";
import Header from "./Header";
import Logo from "./Logo";
import Link from "next/link";
import LanguageSkills from "./LanguageSkills";
import useLoggedInUser from "@/lib/useGetLoggedInUser";
import { User } from "./User";
import { Crown } from "lucide-react";
import { IoNotificationsOutline } from "react-icons/io5";
import fetchWithAuth from "../../lib/fetchWithAuth";
import NotificationBell from "@/app/notifications/page"; // আগের মতো রাখো

const PAGE_SIZE = 10;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, error } = useLoggedInUser();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);
  const panelRef = useRef(null);

  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

 const loadNotifications = useCallback(
    async (initial = false) => {
      // ⛔ Bail early if tokens are missing
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        console.warn("No tokens found, skipping notification fetch.");
        return;
      }
      try {
        const currentPage = initial ? 1 : page;
        const response = await fetchWithAuth(
          `${baseUrl}/user/notification?page=${currentPage}&limit=${PAGE_SIZE}`
        );
        const data = await response.json();
        const fetched = Array.isArray(data.data) ? data.data : [];

        setHasMore(fetched.length === PAGE_SIZE);

        if (initial) {
          setNotifications(fetched);
          setPage(1);
          setUnreadCount(fetched.unseenCount || 0);
        } else {
          setNotifications((prev) => [...prev, ...fetched]);
        }
      } catch {
        if (initial) {
          setNotifications([]);
          setUnreadCount(0);
          setHasMore(false);
        }
      }
    },
    [page, baseUrl]
  );

  useEffect(() => {
    loadNotifications(true);
    const interval = setInterval(() => loadNotifications(true), 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const loadMore = async () => {
    if (!hasMore || notifLoading) return;
    setNotifLoading(true);
    setTimeout(async () => {
      try {
        const nextPage = page + 1;
        const response = await fetchWithAuth(
          `${baseUrl}/user/notification?page=${nextPage}&limit=${PAGE_SIZE}`
        );
        const data = await response.json();
        const fetched = Array.isArray(data.data) ? data.data : [];
        setHasMore(fetched.length === PAGE_SIZE);
        setNotifications((prev) => [...prev, ...fetched]);
        setPage(nextPage);
      } catch {
        setHasMore(false);
      }
      setNotifLoading(false);
    }, 800);
  };

  const handleNotifClick = () => {
    setNotifOpen(true);
    setUnreadCount(0);
  };
  const handleNotifClose = () => setNotifOpen(false);

  if (loading) return <></>;

  return (
    <>
      <div id="hide-above-navbar"></div>
      <header
        id="navbar-sticky"
        className="flex items-center gap-x-7 justify-between lg:h-[110px] border border-red-700 p-4 md:p-10 rounded-full mt-7 lg:w-[80%] w-[95%] mx-auto sticky top-0 z-[100] bg-white shadow-lg transition-all duration-300"
        style={{ left: 0, right: 0 }}
      >
        <div>
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <nav className="items-center hidden gap-4 lg:flex">
          <Link
            href="/"
            className="text-[20px] font-[400] text-gray-900 hover:text-black"
          >
            Home
          </Link>
          <SkillsButton isOpen={isOpen} setIsOpen={setIsOpen} />
          <Link
            href="/mock-test"
            className="text-[20px] font-[400] text-gray-900 hover:text-black"
          >
            Mock Test
          </Link>
          <Link
            href="/subscription/pricing"
            className="text-[20px] font-[400] text-gray-900 hover:text-black"
          >
            Pricing
          </Link>
          <Link
            href="/company/about"
            className="text-[20px] font-[400] text-gray-900 hover:text-black"
          >
            About US
          </Link>
        </nav>

        {user ? (
          <div className="hidden lg:flex items-center gap-4">
            <div
              className="relative text-[#7D0000] text-[36px] cursor-pointer"
              onClick={handleNotifClick}
            >
              <span
                className={`absolute -top-2 -right-2 bg-[#7D0000] text-white text-xs font-bold rounded-full p-1 w-5 h-5 ${
                  unreadCount === 0 ? "hidden" : ""
                }`}
              >
                {unreadCount}
              </span>
              <IoNotificationsOutline />
            </div>
            <NotificationBell
              open={notifOpen}
              setOpen={setNotifOpen}
              notifications={notifications}
              hasMore={hasMore}
              loading={notifLoading}
              onLoadMore={loadMore}
              onClose={handleNotifClose}
              panelRef={panelRef}
              renderItem={(notification) => (
                <div className="px-4 py-2 border-b border-gray-100 text-gray-900 text-sm">
                  {notification}
                </div>
              )}
              portal={true} 
            />

            <div className="relative ">
              <User user={user} loading={loading} error={error} className="z-50" />
              <div className="absolute right-30 top-12 bg-yellow-500 flex items-center gap-x-1 text-white p-0.5 text-[12px] rounded">
                <Crown className="w-[15px] h-auto" />
                <span>{user.user.userSubscription.credits}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="items-center hidden gap-4 lg:flex">
            <Link
              href="/auth/login"
              className="text-[20px] gap-2 font-[400] text-gray-900 flex items-center"
            >
              <span>Login</span> <FaRightLong className="text-[20px]" />
            </Link>

            <Link href="/auth/sign-up" className="text-[20px] font-[400] ml-4 bg-gradient-to-r from-[#D80000] to-[#720000] p-8 text-white px-4 py-2 rounded-full w-[289px] h-[60px] flex items-center justify-center hover:bg-gradient-to-r hover:from-[#720000] transition-all duration-300">
              Sign Up
            </Link>
          </div>
        )}

        <div className="lg:hidden">
          <Header isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </header>

      <div className="w-[95%] relative mx-auto mt-4">
        {isOpen && (
          <LanguageSkills
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            className="w-full bg-white"
          />
        )}
      </div>
    </>
  );
}
