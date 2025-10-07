"use client";

import "../page.css";
import Header from "../../Header/page";
import Footer from "@/app/Footer/page";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getFirebaseToken } from "@/utils";

export default function StudentWebinars() {
  interface Webinar {
    _id?: string;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    mode: string;
    link: string;
    studentsApplied?: string[];
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [registeringWebinar, setRegisteringWebinar] = useState<string | null>(
    null
  );

  const router = useRouter();

  const fetchWebinars = async () => {
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/webinar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch webinars");
      setWebinars(data.webinars);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (webinarId: string) => {
    if (!currentUser?.email) return;
    setRegisteringWebinar(webinarId);
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/webinar/${webinarId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: currentUser.email, action: "register" }),
      });
      if (!res.ok) throw new Error("Failed to register");

      const userEmail = currentUser.email;
      setWebinars((prevWebinars) =>
        prevWebinars.map((webinar) =>
          webinar._id === webinarId
            ? {
                ...webinar,
                studentsApplied: [
                  ...(webinar.studentsApplied || []),
                  userEmail,
                ],
              }
            : webinar
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to register. Please try again.");
    } finally {
      setRegisteringWebinar(null);
    }
  };

  const [deregisteringWebinar, setDeregisteringWebinar] = useState<
    string | null
  >(null);
  const handleDeregister = async (webinarId: string) => {
    if (!currentUser?.email) return;
    setDeregisteringWebinar(webinarId);
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/webinar/${webinarId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: currentUser.email,
          action: "deregister",
        }),
      });
      if (!res.ok) throw new Error("Failed to deregister");

      const userEmail = currentUser.email;
      setWebinars((prevWebinars) =>
        prevWebinars.map((webinar) =>
          webinar._id === webinarId
            ? {
                ...webinar,
                studentsApplied: (webinar.studentsApplied || []).filter(
                  (email) => email !== userEmail
                ),
              }
            : webinar
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to deregister. Please try again.");
    } finally {
      setDeregisteringWebinar(null);
    }
  };

  const filteredWebinars = webinars?.filter((webinar) => {
    const matchesSearch =
      webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode =
      modeFilter === "" ||
      webinar.mode.toLowerCase().includes(modeFilter.toLowerCase());
    return matchesSearch && matchesMode;
  });

  const uniqueModes = [...new Set(webinars?.map((webinar) => webinar.mode))];

  const isAlreadyRegistered = (webinar: Webinar) => {
    return webinar.studentsApplied?.includes(currentUser?.email || "") || false;
  };

  const getDateStatus = (date: string) => {
    if (!date) return null;
    const webinarDate = new Date(date);
    const today = new Date();
    const diffTime = webinarDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { status: "expired", color: "red", text: "Past Event" };
    if (diffDays <= 3)
      return {
        status: "urgent",
        color: "orange",
        text: `${diffDays} days left`,
      };
    if (diffDays <= 7)
      return { status: "soon", color: "yellow", text: `${diffDays} days left` };
    return { status: "normal", color: "green", text: `${diffDays} days left` };
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchWebinars();
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, []);

  return (
    <>
      <Header />
      <main className="w-[95%] min-h-[85vh] lg:w-full max-w-7xl mx-auto py-10 md:py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Webinars
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join interactive webinars from industry experts and thought leaders.
            Expand your knowledge and network with professionals!
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-white rounded-full px-6 py-2 shadow-lg border border-gray-200">
              <span className="text-indigo-600 font-semibold">
                {webinars?.length} webinars available
              </span>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="grid gap-6">
              <div className="group">
                <label className="block text-sm md:text-base lg:text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  Search Webinars
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 bg-white shadow-sm hover:shadow-md pl-12"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔎
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-8"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl animate-pulse">🎓</span>
              </div>
            </div>
            <p className="text-xl text-gray-600 font-medium">
              Loading amazing webinars...
            </p>
            <p className="text-gray-500 mt-2">
              Please wait while we fetch the latest sessions
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <span className="text-6xl mb-4 block">😔</span>
              <p className="text-red-700 font-bold text-lg mb-2">
                Oops! Something went wrong
              </p>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchWebinars}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredWebinars?.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 max-w-lg mx-auto shadow-lg">
              <span className="text-8xl mb-6 block">🔍</span>
              <p className="text-2xl text-gray-700 font-bold mb-3">
                {searchTerm || modeFilter
                  ? "No matches found"
                  : "No webinars available"}
              </p>
              <p className="text-gray-500 text-lg">
                {searchTerm || modeFilter
                  ? "Try adjusting your search criteria"
                  : "Check back soon for new webinars!"}
              </p>
              {(searchTerm || modeFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setModeFilter("");
                  }}
                  className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <p className="text-gray-600 text-lg">
                Showing{" "}
                <span className="font-bold text-indigo-600">
                  {filteredWebinars?.length}
                  {filteredWebinars?.length === webinars?.length ? (
                    <>&nbsp;</>
                  ) : null}
                </span>
                {filteredWebinars?.length !== webinars?.length && (
                  <span>
                    {" "}
                    of{" "}
                    <span className="font-bold">{webinars?.length}&nbsp;</span>
                  </span>
                )}
                webinar{webinars?.length !== 1 ? "s" : ""}
                {(searchTerm || modeFilter) && (
                  <span className="ml-2">matching your criteria</span>
                )}
              </p>
            </div>

            <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWebinars?.map((webinar) => {
                const dateStatus = getDateStatus(webinar.date);
                const alreadyRegistered = isAlreadyRegistered(webinar);

                return (
                  <div
                    key={webinar._id}
                    className="bg-white border-2 border-gray-100 rounded-xl shadow-lg hover:shadow-2xl hover:border-indigo-200 transition flex flex-col h-full overflow-hidden group"
                  >
                    <div className="bg-white text-black p-6 text-black relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl text-black font-bold mb-2 line-clamp-2">
                              {webinar.title}
                            </h3>
                          </div>
                          {dateStatus && (
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-3 ${
                                dateStatus.color === "red"
                                  ? "bg-red-500 text-white"
                                  : dateStatus.color === "orange"
                                  ? "bg-orange-500 text-white"
                                  : dateStatus.color === "yellow"
                                  ? "bg-yellow-500 text-black"
                                  : "bg-green-500 text-white"
                              }`}
                            >
                              {dateStatus.text}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex">
                              <span className="font-semibold text-gray-600 min-w-0 flex items-center">
                                Mode:&nbsp;
                              </span>
                              <span className="font-medium">
                                {webinar.mode}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="font-semibold min-w-0 flex text-gray-600 items-center">
                                Date:
                              </span>
                              <span className="ml-2 text-gray-800 font-bold">
                                {webinar.date
                                  ? new Date(webinar.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )
                                  : "TBA"}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="font-semibold text-gray-600 min-w-0 flex items-center">
                                Time:&nbsp;
                              </span>
                              <span className="font-medium">
                                {webinar.time || "TBA"}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="font-semibold text-gray-600 min-w-0 flex items-center">
                                Duration:&nbsp;
                              </span>
                              <span className="font-medium">
                                {webinar.duration || "TBA"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="mb-3">
                            <span className="font-bold text-gray-700 flex items-center">
                              About this webinar:
                            </span>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 group-hover:from-indigo-50 group-hover:to-purple-50 transition-all duration-300">
                            <div
                              className="text-sm text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html:
                                  webinar.description.length > 150
                                    ? webinar.description.substring(0, 150) +
                                      "..."
                                    : webinar.description,
                              }}
                            />
                            {webinar.description.length > 150 && (
                              <div className="mt-3 text-xs text-indigo-600 font-medium">
                                Click &quot;More Info&quot; to read full
                                description →
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex mt-auto">
                        <button
                          onClick={() =>
                            router.push(`/account/webinars/${webinar._id}`)
                          }
                          className="mb-4 flex-1 bg-blue-50 cursor-pointer hover:bg-blue-100 text-blue-700 hover:from-blue-100 hover:to-indigo-100 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center border border-blue-200 hover:border-blue-300 cursor-pointer2"
                        >
                          More Info
                        </button>
                      </div>
                      {webinar.studentsApplied &&
                        webinar.studentsApplied.length > 0 && (
                          <div className="mb-4 text-center">
                            <div className="bg-orange-100 px-4 py-1 rounded-full text-orange-800 text-xs font-medium inline-flex items-center">
                              {webinar.studentsApplied.length} student
                              {webinar.studentsApplied.length !== 1
                                ? "s"
                                : ""}{" "}
                              registered
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
