"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/Header/page";
import Footer from "@/app/Footer/page";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function TestDetails() {
  interface Test {
    _id?: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    duration: string;
    mode: string;
    link: string;
    instructions?: string[];
    eligibility?: string[];
    deadline?: string;
    studentsApplied?: string[];
  }

  const { id } = useParams(); // dynamic route id
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch test details by id
  const fetchTest = async (testId: string) => {
    try {
      const res = await fetch(`/api/tests/${testId}`);
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

  const handleApply = async () => {
    if (!currentUser?.email || !id) return;
    try {
      const res = await fetch(`/api/tests/${id}`, {
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
        if (id) fetchTest(id as string);
      } else {
        router.push("/"); // redirect if not logged in
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
    <div className="bg-white border border-gray-200 hover:shadow-xl rounded-xl p-6 transition-all duration-300 w-full max-w-lg transform hover:-translate-y-1">
      <h2 className="text-3xl font-bold mb-4 text-center">{test.title}</h2>
      <p className="mb-2">
        <span className="font-medium">Date:</span> {test.date}
      </p>
      {test.time ? (
        <p className="mb-2">
          <span className="font-medium">Time:</span> {test.time}
        </p>
      ) : null}
      <p className="mb-2">
        <span className="font-medium">Duration:</span> {test.duration}
      </p>
      <p className="mb-2">
        <span className="font-medium">Mode:</span> {test.mode}
      </p>
      <p className="mb-2">
        <span className="font-medium">Deadline:</span> {test.deadline}
      </p>
      <p className="mt-4 text-gray-700">{test.description}</p>

      {test.instructions && test.instructions.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold">Instructions:</h3>
          <ul className="list-disc list-inside">
            {test.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ul>
        </div>
      )}

      {test.eligibility && test.eligibility.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold">Eligibility:</h3>
          <ul className="list-disc list-inside">
            {test.eligibility.map((el, i) => (
              <li key={i}>{el}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={handleApply}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
        >
          Apply
        </button>
      </div>
    </div>
  )}
</main>

      <Footer />
    </>
  );
}
