"use client";

import "../page.css";
import Header from "../../Header/page";
import Footer from "@/app/Footer/page";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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
      const res = await fetch(`/api/jobs`);
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
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
      <main className="w-[95%] min-h-[85vh] lg:w-full max-w-6xl mx-auto py-10 md:py-16 px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-12">
          Available Jobs
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Loading jobs...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-600">No jobs available.</p>
        ) : (
          <section
            className={`grid gap-6 justify-center ${
              jobs.length < 3
                ? jobs.length === 1
                  ? "grid-cols-1 place-items-center"
                  : "grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {" "}
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-gray-200 hover:shadow-xl rounded-xl p-6 transition-all duration-300 flex flex-col justify-between w-full max-w-sm transform hover:-translate-y-1"
              >
                <h3 className="text-2xl font-semibold mb-2">{job.company}</h3>
                <p>
                  <span className="font-medium">Role:</span> {job.role}
                </p>
                <p>
                  <span className="font-medium">Location:</span> {job.location}
                </p>
                <p>
                  <span className="font-medium">Deadline:</span>{" "}
                  {job.deadline
                    ? new Date(job.deadline).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="mt-2 text-gray-700">{job.description}</p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => router.push(`/account/jobs/${job._id}`)}
                    className="border-gray-300 border px-5 py-2 rounded-md hover:bg-gray-300 cursor-pointer hover:text-gray-700"
                  >
                    More info
                  </button>
                  <button
                    onClick={() => handleApply(job._id!)}
                    className="bg-indigo-500 cursor-pointer text-white px-5 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
