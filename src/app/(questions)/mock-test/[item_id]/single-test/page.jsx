// "use client"
// import React, { useEffect, useState,use } from 'react';
// import fetchWithAuth from "../../../../../lib/fetchWithAuth";
// const SingleTest = ({ params: paramsPromise }) => {
//   const { item_id } = use(paramsPromise);
//   const [loading, setLoading] = useState(true);
//   const [testData, setTestData] = useState(null);
//   const baseUrl = process.env.NEXT_PUBLIC_URL;

//     const fetchUserData = async () => {
//     try {
//       setLoading(true);
//       const response = await fetchWithAuth(`${baseUrl}/full-mock-test/get/${item_id}`);
//       if (!response.ok)
//         throw new Error(`HTTP error! status: ${response.status}`);

//       const data = await response.json();
//       setTestData(data);
//     } catch (error) {
//       console.error("Error fetching user info:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (baseUrl) fetchUserData();
//   }, [baseUrl]);
  
//  console.log("test data from single test : ",testData);
 
//   return (
//     <div>{item_id}</div>
//   );
// };

// export default SingleTest;


"use client";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Not Practiced", value: "not_practiced" },
];

function trimText(text, max = 34) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

export default function SpeakingTestAllSubtypes({ params: paramsPromise }) {
  const { item_id } = use(paramsPromise);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [tab, setTab] = useState("all");
  const [allQuestions, setAllQuestions] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetchWithAuth(`${baseUrl}/full-mock-test/get/${item_id}`);
      const result = await res.json();

      // const speakingQuestions = result.questions?.filter(
      //   (q) => q.type === "speaking"
      // ) || [];

      setAllQuestions(result.questions);
      
    } catch (err) {
      setError("Failed to fetch test data");
      setAllQuestions([]);
      setDisplayData([]);
      setTotalPages(1);
    }
    setIsLoading(false);
  };

  

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  console.log("all questions", allQuestions);
  
  

  const handleAppearedClick = (item) => {
    router.push(`/${item.type}/${item.subtype}/${item._id}`);
  };

  // const renderPageNumbers = () => {
  //   const pages = [];
  //   for (let i = 1; i <= totalPages; i++) {
  //     pages.push(
  //       <button
  //         key={i}
  //         onClick={() => handlePageChange(i)}
  //         className={`px-3 py-1 text-sm border rounded 
  //           ${
  //             currentPage === i
  //               ? "bg-[#810000] text-white border-[#810000]"
  //               : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
  //           }`}
  //       >
  //         {i}
  //       </button>
  //     );
  //   }
  //   return pages;
  // };

  // const paginatedData = displayData.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  // const tabStyle = (active) =>
  //   `px-4 py-2 text-base font-medium cursor-pointer border-b-2 transition-all duration-150
  //   ${
  //     active
  //       ? "border-[#810000] text-[#810000] bg-white"
  //       : "border-transparent text-gray-400 bg-white hover:text-[#810000]"
  //   }`;

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-4 px-2 sm:px-4">
      {/* Header */}
      <div className="bg-[#810000] text-white px-2 sm:px-4 py-3 rounded-md flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <h1 className="text-lg font-medium whitespace-nowrap">Mock Test</h1>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b mb-6">
        {FILTER_TABS.map((t) => (
          <div
            key={t.value}
            className={tabStyle(tab === t.value) + " flex-1 text-center"}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#810000]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No questions found</div>
        ) : (
          <div className="flex flex-col gap-4">
            {paginatedData.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-[#810000] bg-[#F8F8F8] rounded-md px-2 py-3 sm:px-6 sm:py-4 gap-2 sm:gap-3"
              >
                <div className="flex-1 w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#810000] font-bold tracking-wider text-[15px] whitespace-nowrap">
                      #{item._id.slice(-6)}
                    </span>
                    <span className="text-gray-400 font-bold text-xl">|</span>
                  </div>
                  <span
                    className="text-gray-700 font-medium truncate w-full block text-[15px] sm:text-base"
                    title={item.heading}
                    style={{ maxWidth: "100%" }}
                  >
                    {trimText(item.heading, window.innerWidth < 480 ? 22 : 36)}
                  </span>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    ({item.subtype})
                  </span>
                </div>
                <div className="flex items-center justify-end w-full sm:w-auto mt-1 sm:mt-0">
                  <button
                    onClick={() => handleAppearedClick(item)}
                    className="bg-[#810000] text-white px-4 sm:px-6 py-1 rounded-full font-medium text-base min-w-[72px] sm:min-w-[90px] text-center shadow hover:bg-[#5d0000] transition"
                  >
                    Appeared
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-[#810000] text-white border-[#810000] hover:bg-[#520000] disabled:bg-gray-300"
          >
            Previous
          </Button>

          <div className="flex gap-1">{renderPageNumbers()}</div>

          <Input
            type="number"
            value={currentPage}
            onChange={(e) => {
              const page = Number.parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
              }
            }}
            className="w-14 sm:w-16 h-8 text-center text-sm"
            min="1"
            max={totalPages}
          />

          <span className="text-sm text-gray-600">{itemsPerPage}</span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-[#810000] text-white border-[#810000] hover:bg-[#520000] disabled:bg-gray-300"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}



