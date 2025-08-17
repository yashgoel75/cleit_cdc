"use client";

import "../page.css";
import Header from "../../Header/page";
import Footer from "@/app/Footer/page";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function StudentTests() {
  interface Test {
    _id?: string;
    title: string;
    description: string;
    date: string;
    duration: string;
    mode: string;
    link: string;
    studentsApplied?: string[];
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchTests = async (email: string | null | undefined) => {
    try {
      const res = await fetch(`/api/tests`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch tests");
      setTests(data.tests);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (testId: string) => {
    if (!currentUser?.email) return;
    try {
      const res = await fetch(`/api/tests/${testId}`, {
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
        fetchTests(user.email);
      } else {
        router.push("/"); // redirect if not logged in
      }
    });
    return () => unsub();
  }, []);

  return (
    <>
      <Header />
      <main className="w-[95%] min-h-[85vh] lg:w-full max-w-6xl mx-auto py-10 md:py-16 px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-12">
          Available Tests
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Loading tests...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : tests.length === 0 ? (
          <p className="text-center text-gray-600">No tests available.</p>
        ) : (
          <section
            className={`grid gap-6 justify-center ${
              tests.length < 3
                ? tests.length === 1
                  ? "grid-cols-1 place-items-center"
                  : "grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {tests.map((test) => (
              <div
                key={test._id}
                className="bg-white border border-gray-200 hover:shadow-xl rounded-xl p-6 transition-all duration-300 flex flex-col justify-between w-full max-w-sm transform hover:-translate-y-1"
              >
                <h3 className="text-2xl font-semibold mb-2">{test.title}</h3>
                <p>
                  <span className="font-medium">Date:</span> {test.date}
                </p>
                <p>
                  <span className="font-medium">Duration:</span> {test.duration}
                </p>
                <p>
                  <span className="font-medium">Mode:</span> {test.mode}
                </p>
                <p className="mt-2 text-gray-700">{test.description}</p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => router.push(`/account/tests/${test._id}`)}
                    className="border-gray-300 border px-5 py-2 rounded-md hover:bg-gray-300 cursor-pointer hover:text-gray-700"
                  >
                    More info
                  </button>
                  <button
                    onClick={() => handleApply(test._id!)}
                    className="bg-indigo-500 text-white px-5 py-2 cursor-pointer rounded-md hover:bg-indigo-700"
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
