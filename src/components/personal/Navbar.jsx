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
import NotificationBell from "@/app/notifications/page";

const FAKE_NOTIFICATIONS = Array.from({ length: 30 }, (_, i) => ({
  id: "fake-" + (i + 1),
  message: `This is a sample notification #${i + 1}`,
  read: false,
  timeAgo: `${(i + 1) * 2} min ago`,
}));
const PAGE_SIZE = 30;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, error } = useLoggedInUser();

  // NOTIFICATION LOGIC
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readIds, setReadIds] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);
  const panelRef = useRef(null);

  // Hide everything above navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById("navbar-sticky");
      if (nav) {
        if (window.scrollY > 0) {
          // Remove anything above navbar by setting a solid bg and z-index
          nav.style.background = "#fff";
          nav.style.boxShadow = "0 2px 16px 0 rgba(0,0,0,0.06)";
        } else {
          nav.style.background = "#fff";
          nav.style.boxShadow = "0 2px 16px 0 rgba(0,0,0,0.06)";
        }
      }
      // Hide absolutely everything above navbar
      const hideAbove = document.getElementById("hide-above-navbar");
      if (hideAbove) {
        if (window.scrollY > 0) {
          hideAbove.style.display = "none";
        } else {
          hideAbove.style.display = "";
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check in case already scrolled
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch notifications (server or fake)
  const loadNotifications = useCallback(
    async (initial = false) => {
      try {
        const response = await fetchWithAuth(`/api/notifications?page=${initial ? 1 : page}&limit=${PAGE_SIZE}`);
        const data = await response.json();
        let fetched = data.notifications || [];
        if (fetched.length === 0 && initial) {
          fetched = FAKE_NOTIFICATIONS.slice(0, PAGE_SIZE);
          setHasMore(true);
        }
        if (initial) {
          setNotifications(fetched);
          setPage(1);
          let newIds = fetched.map((n) => n.id);
          let newCount = newIds.filter(id => !readIds.includes(id)).length;
          setUnreadCount(newCount);
        } else {
          setNotifications((prev) => [...prev, ...fetched]);
        }
        setHasMore(fetched.length === PAGE_SIZE);
      } catch {
        if (initial) {
          setNotifications(FAKE_NOTIFICATIONS.slice(0, PAGE_SIZE));
          let fakeIds = FAKE_NOTIFICATIONS.slice(0, PAGE_SIZE).map(n => n.id);
          let newCount = fakeIds.filter(id => !readIds.includes(id)).length;
          setUnreadCount(newCount);
          setHasMore(true);
        }
      }
    },
    [page, readIds]
  );

  useEffect(() => {
    loadNotifications(true);
    const interval = setInterval(() => loadNotifications(true), 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Load more for infinite scroll
  const loadMore = async () => {
    if (!hasMore || notifLoading) return;
    setNotifLoading(true);
    setTimeout(async () => {
      try {
        const nextPage = page + 1;
        const response = await fetchWithAuth(`/api/notifications?page=${nextPage}&limit=${PAGE_SIZE}`);
        const data = await response.json();
        let fetched = data.notifications || [];
        if (fetched.length === 0 && nextPage * PAGE_SIZE <= FAKE_NOTIFICATIONS.length) {
          const start = (nextPage - 1) * PAGE_SIZE;
          fetched = FAKE_NOTIFICATIONS.slice(start, start + PAGE_SIZE);
          setHasMore(start + PAGE_SIZE < FAKE_NOTIFICATIONS.length);
        } else {
          setHasMore(fetched.length === PAGE_SIZE);
        }
        setNotifications((prev) => [...prev, ...fetched]);
        setPage(nextPage);
      } catch {
        const nextPage = page + 1;
        const start = (nextPage - 1) * PAGE_SIZE;
        const fetched = FAKE_NOTIFICATIONS.slice(start, start + PAGE_SIZE);
        setNotifications((prev) => [...prev, ...fetched]);
        setHasMore(start + PAGE_SIZE < FAKE_NOTIFICATIONS.length);
        setPage(nextPage);
      }
      setNotifLoading(false);
    }, 800);
  };

  const handleNotifClick = () => {
    setNotifOpen(true);
    setReadIds(notifications.map(n => n.id));
    setUnreadCount(0);
  };
  const handleNotifClose = () => setNotifOpen(false);

  if (loading) return <></>;

  return (
    <>
      {/* Add this div to easily hide anything above navbar if needed */}
      <div id="hide-above-navbar"></div>
      <header
        id="navbar-sticky"
        className="flex items-center gap-x-7 justify-between lg:h-[110px] border border-red-700 p-4 md:p-10 rounded-full mt-7 lg:w-[80%] w-[95%] mx-auto sticky top-0 z-[100] bg-white shadow-lg transition-all duration-300"
        style={{
          // Ensures the header always stays at the top and covers everything above on scroll
          left: 0,
          right: 0,
        }}
      >
        {/* logo */}
        <div>
          <Logo />
        </div>
        {/* menu */}
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
        {/* right */}
        {user ? (
          <div className="hidden lg:flex items-center gap-4">
            {/* notifications */}
            <div className="relative text-[#7D0000] text-[36px] cursor-pointer" onClick={handleNotifClick}>
              <span className={`absolute -top-2 -right-2 bg-[#7D0000] text-white text-xs font-bold rounded-full p-1 w-5 h-5 ${unreadCount === 0 ? "hidden" : ""}`}>{unreadCount}</span>
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
            />
            {/* user */}
            <div className="relative">
              <User user={user} loading={loading} error={error} />
              <div className="absolute right-25 top-10 bg-yellow-500 flex items-center gap-x-1 text-white p-0.5 text-[12px] rounded ">
                <Crown className="w-[20px] h-auto" /> <span>100</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="items-center hidden gap-4 lg:flex">
            <Link
              href="/auth/login"
              className="text-[20px] gap-2 font-[400] text-gray-900 flex items-center"
            >
              <span>Login</span>{" "}
              <FaRightLong className="text-[20px] font-[400] text-gray-900" />
            </Link>
            <Link
              href="/"
              className="text-[20px] font-[400] ml-4 bg-gradient-to-r from-[#D80000] to-[#720000] p-8 text-white px-4 py-2 rounded-full w-[289px] h-[60px] flex items-center justify-center hover:bg-gradient-to-r hover:from-[#720000] transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>
        )}
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Header isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </header>
      <div className="w-[95%] relative mx-auto mt-4">
        {/* Language Skills Modal */}
        {isOpen && <LanguageSkills isOpen={isOpen} setIsOpen={setIsOpen} />}
      </div>
    </>
  );
}