"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import fetchWithAuth from "../../lib/fetchWithAuth";
import { Bell, X } from "lucide-react";

// ৩০টা ফেইক নোটিফিকেশন (উদাহরণ)
const FAKE_NOTIFICATIONS = Array.from({ length: 30 }, (_, i) => ({
  id: "fake-" + (i + 1),
  message: `This is a sample notification #${i + 1}`,
  read: false,
  timeAgo: `${(i + 1) * 2} min ago`,
}));

const PAGE_SIZE = 10;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [anim, setAnim] = useState(false);
  const bellRef = useRef(null);
  const panelRef = useRef(null);

  // শুধুমাত্র নতুন আসলে কাউন্ট বাড়বে
  const [lastFetchedIds, setLastFetchedIds] = useState([]);

  // Fetch notifications, paginated
  const loadNotifications = useCallback(
    async (initial = false) => {
      try {
        const response = await fetchWithAuth(`/api/notifications?page=${initial ? 1 : page}&limit=${PAGE_SIZE}`);
        const data = await response.json();
        let fetched = data.notifications || [];
        // fallback to fake
        if (fetched.length === 0 && initial) {
          fetched = FAKE_NOTIFICATIONS.slice(0, PAGE_SIZE);
          setHasMore(true);
        }
        if (initial) {
          setNotifications(fetched);
          setPage(1);
          // নতুন নোটিফিকেশন চেক: আগের আইডি না থাকলে কাউন্ট বাড়াবে, না হলে থাকবে
          let newIds = fetched.map((n) => n.id);
          let newCount = 0;
          if (lastFetchedIds.length > 0) {
            // শুধু নতুন আইডি গুনো
            newCount = newIds.filter(id => !lastFetchedIds.includes(id)).length;
          } else {
            // প্রথমবার সব কাউন্ট
            newCount = newIds.length;
          }
          setUnreadCount(newCount);
          setLastFetchedIds(newIds);
        } else {
          setNotifications((prev) => [...prev, ...fetched]);
        }
        setHasMore(fetched.length === PAGE_SIZE);
      } catch {
        if (initial) {
          setNotifications(FAKE_NOTIFICATIONS.slice(0, PAGE_SIZE));
          setUnreadCount(FAKE_NOTIFICATIONS.slice(0, PAGE_SIZE).length);
          setLastFetchedIds(FAKE_NOTIFICATIONS.slice(0, PAGE_SIZE).map((n) => n.id));
          setHasMore(true);
        }
      }
    },
    [page, lastFetchedIds]
  );

  // Initial load, ৩০ সেকেন্ড পরপর রিফ্রেশ
  useEffect(() => {
    loadNotifications(true);
    const interval = setInterval(() => loadNotifications(true), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  // Load more (infinite scroll)
  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
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
      setLoading(false);
    }, 800);
  };

  // ডানদিক থেকে ফেড ইন
  const handleBellClick = () => {
    setAnim(true);
    setOpen(true);
    // ক্লিক করলে কাউন্ট ০, আবার নতুন না আসা পর্যন্ত বাড়বে না
    if (unreadCount > 0) {
      setUnreadCount(0);
      // ব্যাকেন্ডে রিড মার্ক করতে চাইলে এখানে POST করতে পারো
      fetchWithAuth("/api/notifications/mark-read", { method: "POST" });
    }
  };

  // প্যানেল ক্লোজ
  const handleClose = () => {
    setAnim(false);
    setTimeout(() => setOpen(false), 2000); // ২ সেকেন্ডে fadeout
  };

  // ইনফিনিটি স্ক্রল
  useEffect(() => {
    if (!open) return;
    const listDiv = panelRef.current;
    if (!listDiv) return;
    const handleScroll = () => {
      if (
        listDiv.scrollTop + listDiv.clientHeight >= listDiv.scrollHeight - 10 &&
        hasMore &&
        !loading
      ) {
        loadMore();
      }
    };
    listDiv.addEventListener("scroll", handleScroll);
    return () => listDiv.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line
  }, [open, hasMore, loading, notifications, page]);

  return (
    <div className="relative z-[3000]" ref={bellRef}>
      {/* Bell button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Open notifications"
      >
        <Bell className="w-7 h-7 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow">
            {unreadCount}
          </span>
        )}
      </button>
      {/* ডানদিক থেকে ফুলস্ক্রিন প্যানেল */}
      {open && (
        <div
          className={`fixed inset-0 flex justify-end items-stretch z-[3000]`}
          style={{ pointerEvents: open ? "auto" : "none" }}
        >
          {/* Overlay */}
          <div
            className={`bg-black/30 w-full h-full transition-opacity duration-700`}
            style={{ opacity: anim ? 1 : 0 }}
            onClick={handleClose}
          />
          {/* Panel */}
          <div
            className={`
              fixed top-0 right-0 h-full max-h-screen w-full sm:w-[480px] bg-white shadow-2xl z-[3100]
              flex flex-col
              transition-all
              duration-[2000ms]
              ease-in-out
              ${anim ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            `}
            style={{
              borderTopLeftRadius: "30px",
              borderBottomLeftRadius: "30px",
              boxShadow: "0 0 50px 0 #0003",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-9 py-7 border-b bg-gradient-to-l from-[#a91e22] to-[#c44545] text-white rounded-tl-[30px]">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold tracking-wide">Notifications</span>
                <span className="text-xs text-white/80">{notifications.length} total</span>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/20 transition"
                aria-label="Close notification panel"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
            {/* Content */}
            <ul
              ref={panelRef}
              className="flex-1 overflow-y-auto py-5 px-6"
              style={{ minHeight: "180px" }}
            >
              {notifications.length === 0 && !loading ? (
                <li className="py-10 text-gray-400 text-center text-lg">
                  No notifications!
                </li>
              ) : (
                notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`
                      mb-3 last:mb-0 p-5 rounded-xl border border-gray-100 shadow-sm bg-gradient-to-br
                      ${!n.read ? "from-[#fff0f0] via-[#ffeaea] to-white" : "from-white to-white"}
                      flex items-start gap-3
                      animate-fadein
                    `}
                  >
                    <div className={`mt-2 h-2 w-2 rounded-full ${!n.read ? "bg-red-500" : "bg-gray-300"}`} />
                    <div className="flex-1">
                      <div className="text-gray-900 text-[16.5px] font-medium mb-1">{n.message}</div>
                      <div className="text-xs text-gray-400">{n.timeAgo}</div>
                    </div>
                  </li>
                ))
              )}
              {/* Loader */}
              {loading && (
                <li className="flex justify-center items-center py-6">
                  <span className="animate-spin inline-block w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full" />
                </li>
              )}
              {!hasMore && notifications.length > 0 && (
                <li className="text-center text-xs text-gray-400 py-2">
                  No more notifications
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
      <style jsx>{`
        .animate-fadein {
          animation: fadeinNotif 0.6s;
        }
        @keyframes fadeinNotif {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}