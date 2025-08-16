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
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <div
                key={test._id}
                className="bg-white border rounded-xl shadow-md p-6 hover:shadow-xl"
                onClick={() => router.push(`/account/tests/${test._id}`)}
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
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => handleApply(test._id!)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
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
