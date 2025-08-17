"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/Header/page";
import Footer from "@/app/Footer/page";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function JobDetails() {
  interface Job {
    _id?: string;
    company: string;
    role: string;
    location: string;
    description: string;
    deadline: string;
    postedAt?: string;
    jobDescriptionPdf?: string;
    eligibility?: string[];
    linkToApply?: string;
    studentsApplied?: string[];
  }

  const { id } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch job");
      setJob(data.job);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!currentUser?.email || !id) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, {
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
        if (id) fetchJob(id as string);
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, [id]);

  return (
    <>
      <Header />
      <main className="w-full flex items-center justify-center px-4 py-10 md:py-16">
        {loading ? (
          <p className="text-center text-gray-600">Loading job details...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : !job ? (
          <p className="text-center text-gray-600">Job not found.</p>
        ) : (
          <div className="bg-white border border-gray-200 hover:shadow-xl rounded-xl p-6 transition-all duration-300 w-full max-w-lg transform hover:-translate-y-1">
            <h2 className="text-3xl font-bold mb-4 text-center">{job.role}</h2>
            <p className="mb-2">
              <span className="font-medium">Company:</span> {job.company}
            </p>
            <p className="mb-2">
              <span className="font-medium">Location:</span> {job.location}
            </p>
            <p className="mb-2">
              <span className="font-medium">Deadline:</span> {job.deadline}
            </p>
            <p className="mt-4 text-gray-700">{job.description}</p>

            {job.eligibility && job.eligibility.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold">Eligibility:</h3>
                <ul className="list-disc list-inside">
                  {job.eligibility.map((el, i) => (
                    <li key={i}>{el}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.jobDescriptionPdf && (
              <div className="mt-6 text-center">
                <a
                  href={job.jobDescriptionPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Job Description PDF
                </a>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
              {job.linkToApply && (
                <a
                  href={job.linkToApply}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 text-center"
                >
                  Apply via Company Site
                </a>
              )}
              <button
                onClick={handleApply}
                className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
              >
                Apply Here
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
