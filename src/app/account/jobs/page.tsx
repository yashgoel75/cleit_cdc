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
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchJobs = async () => {
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: currentUser.email }),
      });
      if (!res.ok) throw new Error("Failed to apply");
      alert("Applied successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to apply");
    }
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
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover exciting job opportunities from top companies. Find your next career move!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading job opportunities...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-xl text-gray-600 font-medium">No job opportunities available</p>
              <p className="text-gray-500 mt-2">Check back soon for new listings!</p>
            </div>
          </div>
        ) : (
          <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border-2 border-gray-100 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
              >
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">
                      {job.company}
                    </h3>
                    <p className="text-emerald-600 font-semibold text-lg line-clamp-1">
                      {job.role}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ml-2">
                    Open
                  </div>
                </div>
                
                {/* Job Details */}
                <div className="space-y-3 mb-4 flex-1">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium min-w-0">Location:</span>
                    <span className="ml-2 text-gray-800 font-semibold line-clamp-1">
                      {job.location}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Deadline:</span>
                    <span className="ml-2 text-gray-800 font-semibold">
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : "No deadline"}
                    </span>
                  </div>

                  {/* Description Preview */}
                  <div className="mt-4">
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">About this role:</span>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                      <div
                        className="text-sm text-gray-700 leading-relaxed max-h-20 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: job.description }}
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        Click &quot;More Info&quot; to see full description
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 mt-auto">
                  <button
                    onClick={() => router.push(`/account/jobs/${job._id}`)}
                    className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center border border-blue-200 hover:border-blue-300 cursor-pointer"
                  >
                    More Info
                  </button>
                  <button
                    onClick={() => handleApply(job._id!)}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>

                {/* Application Status Indicator */}
                {job.studentsApplied && job.studentsApplied.length > 0 && (
                  <div className="mt-3 text-center">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                      {job.studentsApplied.length} student{job.studentsApplied.length !== 1 ? 's' : ''} applied
                    </span>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
