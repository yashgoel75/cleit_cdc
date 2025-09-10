"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/Header/page";
import Footer from "@/app/Footer/page";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirebaseToken } from "@/utils";
import "./page.css";
export default function TestDetails() {
  interface Test {
    _id?: string;
    title: string;
    description: string; // Now rendered as HTML
    date: string;
    deadline: string; // includes both date + time
    duration: string;
    mode: string;
    link: string;
    pdfUrl: string;
    studentsApplied?: string[];
    extraFields?: { fieldName: string; fieldValue: string }[];
  }

  const { id } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTest = async (testId: string) => {
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch test");
      setTest(data.test);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const [isStudentApplied, setIsStudentApplied] = useState(false);
  useEffect(() => {
    const isAlreadyApplied = () => {
      if (!currentUser?.email || !test) return false;
      setIsStudentApplied(
        test.studentsApplied?.includes(currentUser.email) || false
      );
    };
    isAlreadyApplied();
  }, [test, currentUser]);

  const handleApply = async () => {
    if (!currentUser?.email || !id) return;
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/tests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: currentUser.email }),
      });
      if (!res.ok) throw new Error("Failed to apply");
      setIsStudentApplied(true);
    } catch (err) {
      console.error(err);
      alert("Failed to apply");
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        if (id) fetchTest(id as string);
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, [id]);

  return (
    <>
      <Header />
      <main className="w-full flex justify-center px-4 py-10 md:py-16">
        {loading ? (
          <p className="text-center text-gray-600">Loading test details...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : !test ? (
          <p className="text-center text-gray-600">Test not found.</p>
        ) : (
          <div className="bg-white border border-gray-200 hover:shadow-xl rounded-xl p-6 transition-all duration-300 w-full max-w-2xl transform hover:-translate-y-1">
            <h2 className="text-3xl font-bold mb-4 text-center text-indigo-700">
              {test.title}
            </h2>

            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">📅 Date:</span> {test.date}
              </p>
              <p>
                <span className="font-medium">⏳ Duration:</span>{" "}
                {test.duration}
              </p>
              <p>
                <span className="font-medium">💻 Mode:</span> {test.mode}
              </p>
              <p>
                <span className="font-medium">🕒 Deadline:</span>{" "}
                {new Date(test.deadline).toLocaleString()}
              </p>
            </div>

            {test.extraFields && test.extraFields.length > 0 && (
              <div className="mt-6 rounded-lg shadow-lg p-5 mt-6 bg-indigo-50 border-gray-300 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Additional Details
                </h3>
                <ul className="space-y-2">
                  {test.extraFields.map((field, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between border-b border-gray-300 pb-2"
                    >
                      <span className="font-medium">{field.fieldName}:</span>
                      <span className="text-gray-700">
                        {field.fieldValue.startsWith(
                          "https://res.cloudinary.com"
                        ) ? (
                          <a target="_blank" href={field.fieldValue}>
                            <span className="underline text-indigo-600">
                              View Test PDF
                            </span>
                          </a>
                        ) : (
                          field.fieldValue
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className="mt-6 prose prose-blue max-w-none"
              dangerouslySetInnerHTML={{ __html: test.description }}
            />

            <div className="flex justify-center gap-4 mt-8">
              <a
                href={test.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-green-500 text-white px-5 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  isStudentApplied
                    ? "cursor-not-allowed"
                    : "hover:bg-green-700"
                }`}
              >
                Apply via Portal
              </a>

              <button
                onClick={handleApply}
                disabled={isStudentApplied}
                className={`bg-indigo-500 text-white px-5 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  isStudentApplied
                    ? "cursor-not-allowed"
                    : "hover:bg-indigo-700"
                }`}
              >
                {isStudentApplied ? "Applied" : "Applied on Portal?"}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
