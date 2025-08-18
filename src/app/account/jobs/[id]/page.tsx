"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/Header/page";
import Footer from "@/app/Footer/page";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirebaseToken } from "@/utils";

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
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch job details.");
      setJob(data.job);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!currentUser?.email || !id) return;
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: currentUser.email }),
      });
      if (!res.ok) throw new Error("Failed to apply.");
      alert("Application submitted successfully.");
    } catch (err) {
      console.error(err);
      alert("There was a problem submitting your application.");
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
      <main className="w-full flex items-center justify-center px-4 py-10 md:py-16 min-h-[85vh]">
        {loading ? (
          <p className="text-center text-gray-600 text-lg">Loading job details...</p>
        ) : error ? (
          <p className="text-center text-red-600 font-medium">{error}</p>
        ) : !job ? (
          <p className="text-center text-gray-600">Job not found.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-2xl shadow-md">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">{job.role}</h1>

            <div className="space-y-3 text-gray-700">
              <p><span className="font-semibold">Company:</span> {job.company}</p>
              <p><span className="font-semibold">Location:</span> {job.location}</p>
              <p><span className="font-semibold">Deadline:</span> {job.deadline}</p>
              {job.postedAt && (
                <p><span className="font-semibold">Posted On:</span> {new Date(job.postedAt).toLocaleDateString()}</p>
              )}
            </div>

            <div className="mt-6">
              <h2 className="font-semibold text-lg mb-2">Job Description</h2>
              <p className="text-gray-800 whitespace-pre-line">{job.description}</p>
            </div>

            {job.eligibility?.length || 0 > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Eligibility Criteria</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {job.eligibility?.map((el, idx) => (
                    <li key={idx}>{el}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.jobDescriptionPdf && (
              <div className="mt-6">
                <a
                  href={job.jobDescriptionPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  View Full Job Description (PDF)
                </a>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
              {job.linkToApply && (
                <a
                  href={job.linkToApply}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md text-center"
                >
                  Apply on Company Site
                </a>
              )}
              <button
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-md"
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
