"use client";

import "../page.css";
import Header from "../../Header/page";
import Footer from "@/app/Footer/page";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getFirebaseToken } from "@/utils";

export default function StudentJobs() {
  interface Job {
    _id?: string;
    company: string;
    role: string;
    location: string;
    description: string;
    deadline: string;
    linkToApply: string;
    studentsApplied?: string[];
    extraFields?: { fieldName: string; fieldValue: string }[];
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [applyingJob, setApplyingJob] = useState<string | null>(null);

  const router = useRouter();

  const fetchJobs = async () => {
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch jobs");
      setJobs(data.jobs);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!currentUser?.email) return;
    setApplyingJob(jobId);
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: currentUser.email, action: "register" }),
      });
      if (!res.ok) throw new Error("Failed to apply");

      const userEmail = currentUser.email;
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId
            ? {
                ...job,
                studentsApplied: [...(job.studentsApplied || []), userEmail],
              }
            : job
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to apply. Please try again.");
    } finally {
      setApplyingJob(null);
    }
  };

  const [deregisteringJob, setDeregisteringJob] = useState<string | null>(null);
  const handleDeregister = async (jobId: string) => {
    if (!currentUser?.email) return;
    setDeregisteringJob(jobId);
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs/${jobId}`, {
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
      if (!res.ok) throw new Error("Failed to apply");

      const userEmail = currentUser.email;
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId
            ? {
                ...job,
                studentsApplied: (job.studentsApplied || []).filter(
                  (email) => email !== userEmail
                ),
              }
            : job
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to apply. Please try again.");
    } finally {
      setDeregisteringJob(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "" ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const uniqueLocations = [...new Set(jobs.map((job) => job.location))];

  const isAlreadyApplied = (job: Job) => {
    return job.studentsApplied?.includes(currentUser?.email || "") || false;
  };

  const getDeadlineStatus = (deadline: string) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { status: "expired", color: "red", text: "Expired" };
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
        fetchJobs();
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
            Career Opportunities
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover amazing job opportunities from top companies. Find your
            dream job and take the next step in your career journey!
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-white rounded-full px-6 py-2 shadow-lg border border-gray-200">
              <span className="text-indigo-600 font-semibold">
                {jobs.length} opportunities available
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="grid gap-6">
              <div className="group">
                <label className="block text-sm md:text-base lg:text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  Search Jobs
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by company, role, or keywords..."
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
                <span className="text-2xl animate-pulse">💼</span>
              </div>
            </div>
            <p className="text-xl text-gray-600 font-medium">
              Loading amazing opportunities...
            </p>
            <p className="text-gray-500 mt-2">
              Please wait while we fetch the latest jobs
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
                onClick={fetchJobs}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 max-w-lg mx-auto shadow-lg">
              <span className="text-8xl mb-6 block">🔍</span>
              <p className="text-2xl text-gray-700 font-bold mb-3">
                {searchTerm || locationFilter
                  ? "No matches found"
                  : "No jobs available"}
              </p>
              <p className="text-gray-500 text-lg">
                {searchTerm || locationFilter
                  ? "Try adjusting your search criteria"
                  : "Check back soon for new opportunities!"}
              </p>
              {(searchTerm || locationFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setLocationFilter("");
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
            {/* Results Count */}
            <div className="mb-8 text-center">
              <p className="text-gray-600 text-lg">
                Showing{" "}
                <span className="font-bold text-indigo-600">
                  {filteredJobs.length}
                  {filteredJobs.length === jobs.length ? <>&nbsp;</> : null}
                </span>
                {filteredJobs.length !== jobs.length && (
                  <span>
                    {" "}
                    of <span className="font-bold">{jobs.length}&nbsp;</span>
                  </span>
                )}
                job{jobs.length !== 1 ? "s" : ""}
                {(searchTerm || locationFilter) && (
                  <span className="ml-2">matching your criteria</span>
                )}
              </p>
            </div>

            <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => {
                const deadlineStatus = getDeadlineStatus(job.deadline);
                const alreadyApplied = isAlreadyApplied(job);

                return (
                  <div
                    key={job._id}
                    className="bg-white border-2 border-gray-100 rounded-xl shadow-lg hover:shadow-2xl hover:border-indigo-200 transition flex flex-col h-full overflow-hidden group"
                  >
                    <div className="bg-white text-black p-6 text-black relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl text-black font-bold mb-2 line-clamp-1">
                              {job.company}
                            </h3>
                            <p className="font-semibold text-lg line-clamp-1">
                              {job.role}
                            </p>
                          </div>
                          {deadlineStatus && (
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-3 ${
                                deadlineStatus.color === "red"
                                  ? "bg-red-500 text-white"
                                  : deadlineStatus.color === "orange"
                                  ? "bg-orange-500 text-white"
                                  : deadlineStatus.color === "yellow"
                                  ? "bg-yellow-500 text-black"
                                  : "bg-green-500 text-white"
                              }`}
                            >
                              {deadlineStatus.text}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center">
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex"><span className="font-semibold text-gray-600 min-w-0 flex items-center">
                            Job Location:&nbsp;
                          </span>
                              <span className="font-medium">{job.location}</span></div>
                          <div className="flex">
                          <span className="font-semibold min-w-0 flex text-gray-600 items-center">
                            Deadline:
                            </span>
                            
                          <span className="ml-2 text-gray-800 font-bold">
                            {job.deadline
                              ? new Date(job.deadline).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "No deadline"}
                            </span>
                            </div>
                          </div>

                        </div>

                        {job.extraFields && job.extraFields.length > 0 && (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                              Job Highlights
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {job.extraFields.map((field, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm"
                                >
                                  <span className="font-medium text-gray-700 text-sm">
                                    {field.fieldName}:
                                  </span>
                                  <span className="text-indigo-600 font-bold text-sm">
                            {field.fieldValue.startsWith("https://res.cloudinary.com") ? <a href={field.fieldValue} target="_blank">View PDF</a> : field.fieldValue}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="mb-3">
                            <span className="font-bold text-gray-700 flex items-center">
                              About this role:
                            </span>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 group-hover:from-indigo-50 group-hover:to-purple-50 transition-all duration-300">
                            <div
                              className="text-sm text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html:
                                  job.description.length > 150
                                    ? job.description.substring(0, 150) + "..."
                                    : job.description,
                              }}
                            />
                            {job.description.length > 150 && (
                              <div className="mt-3 text-xs text-indigo-600 font-medium">
                                Click &quot;More Info&quot; to read full description →
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex mt-auto">
                        <button
                          onClick={() =>
                            router.push(`/account/jobs/${job._id}`)
                          }
                          className="mb-4 flex-1 bg-blue-50 cursor-pointer hover:bg-blue-100 text-blue-700 hover:from-blue-100 hover:to-indigo-100 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center border border-blue-200 hover:border-blue-300 cursor-pointer2"
                        >
                          More Info
                        </button>
                      </div>
                      {job.studentsApplied &&
                        job.studentsApplied.length > 0 && (
                          <div className="mb-4 text-center">
                            <div className="bg-orange-100 px-4 py-1 rounded-full text-orange-800 text-xs font-medium inline-flex items-center">
                              {job.studentsApplied.length} student
                              {job.studentsApplied.length !== 1 ? "s" : ""}{" "}
                              applied
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
