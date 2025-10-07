"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/Header/page";
import Footer from "@/app/Footer/page";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirebaseToken } from "@/utils";
import "./page.css";

export default function WebinarDetails() {
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

  const { id } = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  const fetchWebinar = async (webinarId: string) => {
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/webinar/${webinarId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch webinar details.");
      setWebinar(data.webinar);

      if (data.webinar.studentsApplied?.includes(currentUser?.email)) {
        setRegistered(true);
      }

      setError(null);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const [isStudentRegistered, setIsStudentRegistered] = useState(false);
  useEffect(() => {
    const checkRegistration = () => {
      if (!currentUser?.email || !webinar) return false;
      setIsStudentRegistered(
        webinar.studentsApplied?.includes(currentUser?.email) || false
      );
    };
    checkRegistration();
  }, [webinar, currentUser]);

  const handleRegister = async () => {
    if (!currentUser?.email || !id) return;

    setRegistering(true);
    try {
      const token = await getFirebaseToken();

      const res = await fetch(`/api/webinar/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: currentUser.email }),
      });

      if (!res.ok) throw new Error("Failed to register for webinar.");

      setRegistered(true);
      alert("Successfully registered for the webinar!");
    } catch (err) {
      console.error(err);
      alert("There was a problem registering for the webinar.");
    } finally {
      setRegistering(false);
    }
  };

  const handleWithdraw = async () => {
    if (!currentUser?.email || !id) return;

    if (!confirm("Are you sure you want to withdraw your registration?")) {
      return;
    }

    try {
      const token = await getFirebaseToken();

      const res = await fetch(`/api/webinar/${id}?email=${currentUser.email}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to withdraw registration.");

      setRegistered(false);
      setIsStudentRegistered(false);
      alert("Registration withdrawn successfully.");
      if (id) fetchWebinar(id as string);
    } catch (err) {
      console.error(err);
      alert("There was a problem withdrawing your registration.");
    }
  };

  const getWebinarStatus = (date: string) => {
    if (!date) return null;
    const webinarDate = new Date(date);
    const today = new Date();
    const diffTime = webinarDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { status: "completed", color: "gray", text: "Completed" };
    if (diffDays === 0)
      return { status: "today", color: "red", text: "Today!" };
    if (diffDays <= 3)
      return {
        status: "upcoming",
        color: "orange",
        text: `In ${diffDays} days`,
      };
    if (diffDays <= 7)
      return { status: "soon", color: "yellow", text: `In ${diffDays} days` };
    return { status: "normal", color: "green", text: `In ${diffDays} days` };
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (id) fetchWebinar(id as string);
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, [id]);

  return (
    <>
      <Header />
      <main className="w-[95%] lg:w-full max-w-5xl mx-auto px-4 py-10 md:py-16 min-h-[85vh]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-500 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl animate-pulse">🎥</span>
                </div>
              </div>
              <p className="text-xl text-gray-600 font-medium">
                Loading webinar details...
              </p>
              <p className="text-gray-500 mt-2">
                Please wait while we fetch the information
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg text-center">
              <span className="text-6xl mb-4 block">😔</span>
              <p className="text-red-700 font-bold text-lg mb-2">
                Oops! Something went wrong
              </p>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => id && fetchWebinar(id as string)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : !webinar ? (
          <div className="flex items-center justify-center py-20">
            <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto shadow-lg text-center">
              <span className="text-8xl mb-6 block">🔍</span>
              <p className="text-2xl text-gray-700 font-bold mb-3">
                Webinar not found
              </p>
              <p className="text-gray-500 text-lg mb-6">
                The webinar you&apos;re looking for doesn&apos;t exist or has
                been removed.
              </p>
              <button
                onClick={() => router.back()}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-100 rounded-md lg:rounded-2xl shadow-lg md:p-4 lg:p-6 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
            <div className="rounded-md p-6 lg:p-8 relative overflow-hidden">
              <div className="relative z-10 text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 break-words text-indigo-500">
                  {webinar.title}
                </h1>

                {webinar.studentsApplied &&
                  webinar.studentsApplied.length > 0 && (
                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center sm:justify-center gap-4 sm:gap-6 rounded-lg lg:rounded-full py-3 px-4 bg-indigo-50">
                      <div>
                        <span className="mr-2 font-medium">Applications:</span>
                        <span className="font-semibold">
                          {webinar.studentsApplied.length} registered
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="p-4 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <div className="text-2xl mb-2 text-center">📅</div>
                  <div className="text-sm text-gray-600 mb-1 text-center">
                    Date & Time
                  </div>
                  <div className="font-bold text-gray-800 text-center">
                    {webinar.date
                      ? new Date(webinar.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "TBA"}
                  </div>
                  {webinar.time && (
                    <div className="text-gray-600 text-center mt-1">
                      {webinar.time}
                    </div>
                  )}
                  {(() => {
                    const status = getWebinarStatus(webinar.date);
                    return (
                      status && (
                        <div
                          className={`mt-2 px-2 py-1 rounded-full text-xs font-bold text-center ${
                            status.color === "gray"
                              ? "bg-gray-100 text-gray-800"
                              : status.color === "red"
                              ? "bg-red-100 text-red-800"
                              : status.color === "orange"
                              ? "bg-orange-100 text-orange-800"
                              : status.color === "yellow"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {status.text}
                        </div>
                      )
                    );
                  })()}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="text-2xl mb-2 text-center">⏱️</div>
                  <div className="text-sm text-gray-600 mb-1 text-center">
                    Duration
                  </div>
                  <div className="font-bold text-gray-800 text-center">
                    {webinar.duration || "TBA"}
                  </div>
                  {webinar.mode && (
                    <div className="mt-3 text-center">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {webinar.mode}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {webinar.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    About This Webinar
                  </h2>
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div
                      className="text-gray-700 leading-relaxed prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: webinar.description }}
                    />
                  </div>
                </div>
              )}

              {webinar.link && isStudentRegistered && (
                <div className="mb-8">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">
                      Webinar Link
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Click below to join the webinar
                    </p>
                    <a
                      href={webinar.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-6 rounded-lg transition-colors duration-200 cursor-pointer shadow-lg hover:shadow-xl"
                    >
                      Join Webinar
                    </a>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-center gap-6">
                {!isStudentRegistered && !registered ? (
                  <button
                    onClick={handleRegister}
                    disabled={
                      registering ||
                      getWebinarStatus(webinar.date)?.status === "completed"
                    }
                    className={`bg-indigo-500 text-white px-8 py-1 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                      registering ||
                      getWebinarStatus(webinar.date)?.status === "completed"
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-indigo-600 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {registering
                      ? "Registering..."
                      : getWebinarStatus(webinar.date)?.status === "completed"
                      ? "Webinar Completed"
                      : "Register for Webinar"}
                  </button>
                ) : (
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="bg-blue-50 cursor-not-allowed border-2 border-blue-300 text-blue-500 px-8 py-1 rounded-xl font-semibold text-center">
                      Registered
                    </div>
                    <button
                      onClick={handleWithdraw}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-1 rounded-xl font-semibold transition-colors cursor-pointer"
                    >
                      Withdraw Registration
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => router.back()}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1 px-8 rounded-xl transition-colors duration-200 cursor-pointer flex items-center mx-auto"
                >
                  <span className="mr-2">←</span>
                  Back to Webinars
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
