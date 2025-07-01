"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import type { User } from "@/utils/auth";
import { auth } from "@/utils/auth";

interface UserAccount {
  id: string;
  department: string;
  account: string;
  name: string;
  permissions: string[];
}

export default function SettingsPage() {
  const [autoDelete, setAutoDelete] = useState(true);
  const [clearSpace, setClearSpace] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "account">("basic");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock user data
  const [users] = useState<UserAccount[]>([
    {
      id: "1",
      department: "管理員",
      account: "Admin",
      name: "李管理",
      permissions: ["最大權限管理", "帳號建立", "可操作所有部門管理權限"],
    },
    {
      id: "2",
      department: "開發部",
      account: "engineer404",
      name: "王工程",
      permissions: ["該組別逐字稿管理權限", "包含上傳", "下載", "刪除"],
    },
    {
      id: "3",
      department: "開發部",
      account: "engineer200",
      name: "黃測試",
      permissions: ["該組別逐字稿管理權限", "包含上傳", "下載", "刪除"],
    },
    {
      id: "4",
      department: "產品部",
      account: "pm010",
      name: "吳專案",
      permissions: ["該組別逐字稿管理權限", "包含上傳", "下載", "刪除"],
    },
    {
      id: "5",
      department: "產品部",
      account: "design094",
      name: "林設計",
      permissions: ["該組別逐字稿管理權限", "包含上傳", "下載", "刪除"],
    },
    {
      id: "6",
      department: "業務部",
      account: "sales001",
      name: "黃業務",
      permissions: ["該組別逐字稿管理權限", "包含上傳", "下載", "刪除"],
    },
    {
      id: "7",
      department: "客服部",
      account: "cs0001",
      name: "李客服",
      permissions: ["該組別逐字稿管理權限", "包含上傳", "下載", "刪除"],
    },
    {
      id: "8",
      department: "客服部",
      account: "cs0002",
      name: "林客服",
      permissions: ["該組別逐字稿管理權限", "包含上傳", "下載", "刪除"],
    },
  ]);

  useEffect(() => {
    const currentUser = auth.getUser();
    setUser(currentUser);
    setIsAdmin(auth.isAdmin());
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        type="button"
        key="prev"
        onClick={() => {
          handlePageChange(Math.max(1, currentPage - 1));
        }}
        disabled={currentPage === 1}
        className="p-2 disabled:opacity-50"
      >
        <Image src="/icons/ui/left.svg" alt="Previous" width={20} height={20} />
      </button>,
    );

    // Page numbers
    if (startPage > 1) {
      pages.push(
        <button
          type="button"
          key={1}
          onClick={() => {
            handlePageChange(1);
          }}
          className="px-3 py-1 rounded"
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="px-2">
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          type="button"
          key={i}
          onClick={() => {
            handlePageChange(i);
          }}
          className={`px-3 py-1 rounded ${
            i === currentPage ? "bg-[#8181F3] text-white" : "hover:bg-gray-100"
          }`}
        >
          {i}
        </button>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className="px-2">
            ...
          </span>,
        );
      }
      pages.push(
        <button
          type="button"
          key={totalPages}
          onClick={() => {
            handlePageChange(totalPages);
          }}
          className="px-3 py-1 rounded"
        >
          {totalPages}
        </button>,
      );
    }

    // Next button
    pages.push(
      <button
        type="button"
        key="next"
        onClick={() => {
          handlePageChange(Math.min(totalPages, currentPage + 1));
        }}
        disabled={currentPage === totalPages}
        className="p-2 disabled:opacity-50"
      >
        <Image src="/icons/ui/right.svg" alt="Next" width={20} height={20} />
      </button>,
    );

    return pages;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} activeItem="settings" />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">設定</h1>

        {isAdmin ? (
          <>
            {/* Tab Navigation and Search Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("basic");
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "basic"
                      ? "bg-[#E6E6FF] text-[#8181F3]"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  基礎設定
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("account");
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "account"
                      ? "bg-[#E6E6FF] text-[#8181F3]"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  帳號管理
                </button>
              </div>

              {activeTab === "account" && (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="關鍵字搜尋"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      className="w-64 px-4 py-2 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8181F3]"
                    />
                    <Image
                      src="/icons/ui/search.svg"
                      alt="Search"
                      width={20}
                      height={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    />
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 text-[#8181F3] hover:bg-[#E6E6FF] rounded-lg transition-colors flex items-center gap-2"
                  >
                    刪除多筆 ←
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#8181F3] text-white hover:bg-[#6969E0] rounded-lg transition-colors"
                  >
                    新增帳號
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Image
                      src="/icons/ui/more.svg"
                      alt="More"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              )}
            </div>

            {activeTab === "basic" ? (
              <div className="space-y-6 max-w-3xl">
                {/* Auto Delete Setting */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-2">自動刪除</h3>
                      <p className="text-gray-600 text-sm">
                        上傳日起超過30天的逐字稿原始影音檔案，將自動刪除。
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoDelete}
                        onChange={(e) => {
                          setAutoDelete(e.target.checked);
                        }}
                      />
                      <div className="w-16 h-[31px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[33px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all peer-checked:bg-[#8181F3]" />
                    </label>
                  </div>
                </div>

                {/* Clear Space Setting */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-2">清除空間</h3>
                      <p className="text-gray-600 text-sm">
                        若容量使用率達80%，將自動刪除較舊的檔案。
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={clearSpace}
                        onChange={(e) => {
                          setClearSpace(e.target.checked);
                        }}
                      />
                      <div className="w-16 h-[31px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[33px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all peer-checked:bg-[#8181F3]" />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#4A4A5C] text-white">
                        <th className="px-6 py-3 text-left font-medium">
                          權限組別
                        </th>
                        <th className="px-6 py-3 text-left font-medium">
                          帳號
                        </th>
                        <th className="px-6 py-3 text-left font-medium">
                          名稱
                        </th>
                        <th className="px-6 py-3 text-left font-medium">
                          權限範圍
                        </th>
                        <th className="px-6 py-3 text-center font-medium">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className={`border-b ${
                            user.account === "design094"
                              ? "bg-[#F0F0FF]"
                              : index % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-4 text-gray-800">
                            {user.department}
                          </td>
                          <td className="px-6 py-4 text-gray-800">
                            {user.account}
                          </td>
                          <td className="px-6 py-4 text-gray-800">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {user.permissions.join("、")}。
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded transition-colors mx-auto block"
                            >
                              <Image
                                src="/icons/ui/arrow-right-linear.svg"
                                alt="More"
                                width={20}
                                height={20}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {renderPagination()}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>頁面</span>
                    <select
                      value={currentPage}
                      onChange={(e) => {
                        handlePageChange(Number(e.target.value));
                      }}
                      className="px-2 py-1 border rounded"
                    >
                      {Array.from({ length: totalPages }, (_, i) => (
                        <option key={`page-${i + 1}`} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span>/ {totalPages}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6 max-w-3xl">
            {/* Auto Delete Setting */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">自動刪除</h3>
                  <p className="text-gray-600 text-sm">
                    上傳日起超過30天的逐字稿原始影音檔案，將自動刪除。
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={autoDelete}
                    onChange={(e) => {
                      setAutoDelete(e.target.checked);
                    }}
                  />
                  <div className="w-16 h-[31px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[33px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all peer-checked:bg-[#8181F3]" />
                </label>
              </div>
            </div>

            {/* Clear Space Setting */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">清除空間</h3>
                  <p className="text-gray-600 text-sm">
                    若容量使用率達80%，將自動刪除較舊的檔案。
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={clearSpace}
                    onChange={(e) => {
                      setClearSpace(e.target.checked);
                    }}
                  />
                  <div className="w-16 h-[31px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[33px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all peer-checked:bg-[#8181F3]" />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
