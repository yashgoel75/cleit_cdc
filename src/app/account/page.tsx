"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Header from "../Header/page";
import Footer from "../Footer/page";
import "./page.css";
import Image from "next/image";
import linkedin from "@/assets/LinkedIn.png";
import Github from "@/assets/Github.png";
import Leetcode from "@/assets/Leetcode.png";

interface UserProfile {
  name: string;
  username: string;
  enrollmentNumber: string;
  collegeEmail: string;
  phone: number;
  department: string;
  tenthPercentage: number;
  twelfthPercentage: number;
  collegeGPA: number;
  batchStart: number;
  batchEnd: number;
  linkedin: string;
  github: string;
  leetcode: string;
  status: string;
  resume: string;
}

export default function Account() {
  const [falseEndYear, setFalseEndYear] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [UsernameAvailable, setUsernameAvailable] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setCurrentUser(user);
        getUserProfile(user.email);
      } else {
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const getUserProfile = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch user data.");
      }
      const data = await res.json();
      setUserData(data.user);
      setFormData(data.user);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      if (!prev) return null;
      if (name == "username") {
        setUsernameAvailable(false);
        setUsernameExists(false);
      }
      const isNumeric = [
        "tenthPercentage",
        "twelfthPercentage",
        "collegeGPA",
      ].includes(name);
      return {
        ...prev,
        [name]:
          type === "number"
            ? (isNumeric ? parseFloat(value) : parseInt(value, 10)) || 0
            : value,
      };
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameExists) return;
    if (!currentUser?.email || !formData) return;
    if (falseEndYear) return;
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          updates: { ...formData },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      setUserData(data.user);
      setIsEdit(false);
      setIsPreview(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      alert(`Update failed: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    setFalseEndYear(
      !!formData?.batchStart &&
        !!formData?.batchEnd &&
        Number(formData?.batchEnd) <= Number(formData?.batchStart)
    );
  }, [formData]);

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      file.type !== "application/msword" &&
      file.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      alert("Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    setIsUploadingResume(true);

    try {
      const sigRes = await fetch("/api/signresume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "resumes" }),
      });
      const { signature, timestamp, apiKey, folder } = await sigRes.json();

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("api_key", apiKey);
      uploadFormData.append("timestamp", timestamp);
      uploadFormData.append("signature", signature);
      uploadFormData.append("folder", folder);

      const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`;

      const response = await fetch(cloudinaryUploadUrl, {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }

      setResumeUrl(data.secure_url);
      setFormData((prev) =>
        prev ? { ...prev, resume: data.secure_url } : prev
      );
    } catch (err) {
      alert(
        `Resume upload failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploadingResume(false);
    }
  };

  async function checkUsername() {
    setUsernameChecking(true);
    const res = await fetch(
      `/api/register/user?username=${formData?.username}`
    );
    const data = await res.json();
    setUsernameChecking(false);
    if (data.usernameExists) {
      setUsernameExists(true);
    } else {
      setUsernameAvailable(true);
    }
  }
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-[85vh] flex justify-center items-center">
          <p className="text-xl text-gray-600">Loading your account...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !userData || !formData) {
    return (
      <>
        <Header />
        <main className="min-h-[85vh] flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Could Not Load Profile
          </h2>
          <p className="text-gray-500">
            {error || "No profile data was found."}
          </p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="w-[95%] min-h-[85vh] lg:w-full max-w-6xl mx-auto py-10 md:py-16 px-4">
        <h2 className="text-4xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">
          Manage Your Account
        </h2>
        <div className="flex justify-center items-center gap-4 pb-10 font-medium">
          <button
            onClick={() => {
              setIsPreview(false);
              setIsEdit(true);
              setFormData(userData);
            }}
            className={`px-5 md:text-lg py-1 rounded-md border transition duration-300 hover:cursor-pointer ${
              isEdit
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => {
              setIsEdit(false);
              setIsPreview(true);
              // setUsernameAvailable(false);
              // setUsernameAlreadyTaken(false);
            }}
            className={`px-5 md:text-lg py-1 rounded-md border transition duration-300 hover:cursor-pointer ${
              isPreview
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50"
            }`}
          >
            Preview
          </button>
        </div>
        {isPreview ? (
          <div className="space-y-10 text-center">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {userData.name}
              </h3>
              {userData.resume && (
                <div className="flex items-center gap-4">
                  <label className="text-left md:text-lg block font-medium mb-1 text-gray-700">
                    Resume
                  </label>
                  <a
                    href={userData.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                  >
                    📄 View Resume
                  </a>
                </div>
              )}
              <div className="border-gray-300 border-1 my-5"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <p className="block font-medium mb-1 text-gray-700">
                    Username
                  </p>
                  <p className="text-lg">{userData.username}</p>
                </div>

                <div>
                  <p className="block font-medium mb-1 text-gray-700">
                    Enrollment Number
                  </p>
                  <p className="text-lg">{userData.enrollmentNumber}</p>
                </div>

                <div>
                  <p className="block font-medium mb-1 text-gray-700">
                    College Email
                  </p>
                  <p className="text-lg">{userData.collegeEmail}</p>
                </div>

                <div>
                  <p className="block font-medium mb-1 text-gray-700">Phone</p>
                  <p className="text-lg">{userData.phone}</p>
                </div>

                <div>
                  <p className="block font-medium mb-1 text-gray-700">
                    Department
                  </p>
                  <p className="text-lg">{userData.department}</p>
                </div>

                <div>
                  <p className="block font-medium mb-1 text-gray-700">10th %</p>
                  <p className="text-lg">{userData.tenthPercentage}%</p>
                </div>

                <div>
                  <p className="block font-medium mb-1 text-gray-700">12th %</p>
                  <p className="text-lg">{userData.twelfthPercentage}%</p>
                </div>

                <div>
                  <p className="block font-medium mb-1 text-gray-700">
                    College GPA
                  </p>
                  <p className="text-lg">{userData.collegeGPA}</p>
                </div>

                <div>
                  <p className="block font-medium mb-1 text-gray-700">Batch</p>
                  <p className="text-lg">
                    {userData.batchStart} - {userData.batchEnd}
                  </p>
                </div>

                <div>
                  <p className="block font-medium mb-1 text-gray-700">Status</p>
                  <p className="text-lg">{userData.status}</p>
                </div>
              </div>

              <div className="border-gray-300 border-1 my-5"></div>
              <div className="mt-8 flex flex-col justify-start text-left space-y-2">
                {userData.linkedin && (
                  <div className="flex items-center gap-3">
                    <Image
                      src={linkedin}
                      height={25}
                      alt="LinkedIn"
                      className="rounded"
                    ></Image>
                    <a
                      href={`https://linkedin.com/in/${userData.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline onest-bold"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
                {userData.github && (
                  <div className="flex items-center gap-3">
                    <Image
                      src={Github}
                      height={25}
                      alt="Github"
                      className="rounded"
                    ></Image>
                    <a
                      href={`https://github.com/${userData.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline onest-bold"
                    >
                      GitHub
                    </a>
                  </div>
                )}
                {userData.leetcode && (
                  <div className="flex items-center gap-3">
                    <Image src={Leetcode} height={25} alt="Leetcode"></Image>
                    <a
                      href={`https://leetcode.com/u/${userData.leetcode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline onest-bold"
                    >
                      LeetCode
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {isEdit ? (
          <div className="space-y-10 text-base md:text-lg">
            <form onSubmit={handleUpdate} className="space-y-8">
              <section className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 mb-5">
                  Edit your Info
                </h3>
                <div className="mb-5">
                  <label className="block font-medium mb-1 text-gray-700">
                    Resume
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                    {resumeUrl && (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 w-fit text-sm"
                      >
                        View Uploaded Resume
                      </a>
                    )}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleResumeChange}
                      className="my-2 sm:mt-0 w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-indigo-50 file:text-indigo-700
        hover:file:bg-indigo-100"
                    />
                  </div>
                  {isUploadingResume && (
                    <p className="text-gray-500 text-sm mt-2">Uploading...</p>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData?.name || ""}
                      onChange={handleChange}
                      className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Username
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="username"
                        value={formData?.username || ""}
                        onChange={handleChange}
                        className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                      />
                      <button
                        type="button"
                        onClick={() => checkUsername()}
                        disabled={usernameChecking}
                        className={`px-3 min-w-[95px] items-center text-center bg-indigo-500 text-white rounded-md ${usernameChecking ? "cursor-not-allowed opacity-50" : "hover:cursor-pointer"}`}
                      >
                        {usernameChecking ? "Checking" : "Check"}
                      </button>
                    </div>
                    {usernameExists ? (
                      <p className="text-sm text-red-500">
                        Username Already Exists
                      </p>
                    ) : null}
                    {UsernameAvailable ? (
                      <p className="text-sm text-green-700">
                        Username Available
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Enrollment Number
                    </label>
                    <input
                      type="text"
                      name="enrollmentNumber"
                      value={formData?.enrollmentNumber || ""}
                      onChange={handleChange}
                      className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      College Email
                    </label>
                    <input
                      type="email"
                      name="collegeEmail"
                      disabled
                      value={formData?.collegeEmail || ""}
                      onChange={handleChange}
                      className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Phone
                    </label>
                    <input
                      type="number"
                      name="phone"
                      value={formData?.phone || ""}
                      onChange={handleChange}
                      className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    >
                      <option value="">Select...</option>
                      {[
                        "BALLB (H)",
                        "BBALLB (H)",
                        "LL.M (CL)",
                        "LL.M (ADR)",
                        "BBA - 1st Shift",
                        "BBA - 2nd Shift",
                        "B.Com (H)- 1st shift",
                        "B.Com (H)- 2nd shift",
                        "BA(JMC)- 1st shift",
                        "BA(JMC)- 2nd shift",
                        "MAMC",
                        "BCA- 1st shift",
                        "BCA- 2nd shift",
                        "MCA",
                        "BA ECO (H)- 1st shift",
                        "BA ECO (H)- 2nd shift",
                        "MA (ECONOMICS)",
                        "BA ENGLISH (H)",
                        "MA (ENGLISH)",
                        "B.Tech CSE",
                        "B.Tech AI&ML",
                        "B.Tech AI&DS",
                        "B.Tech IIOT",
                        "B.Tech EE (VLSI Design & Technology)",
                        "B.Tech CSE (Cyber Security)",
                        "B.Tech CS(Applied Mathematics)",
                        "B.Tech (LE)- Diploma Holders",
                        "B.Tech (LE)- BSc Graduates",
                      ].map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      10th %
                    </label>
                    <input
                      type="number"
                      name="tenthPercentage"
                      step="0.01"
                      value={formData?.tenthPercentage || ""}
                      onChange={handleChange}
                      className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      12th %
                    </label>
                    <input
                      type="number"
                      name="twelfthPercentage"
                      step="0.01"
                      value={formData?.twelfthPercentage || ""}
                      onChange={handleChange}
                      className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      College GPA
                    </label>
                    <input
                      type="number"
                      name="collegeGPA"
                      step="0.01"
                      value={formData?.collegeGPA || ""}
                      onChange={handleChange}
                      className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-full">
                      <label className="block font-medium mb-1 text-gray-700">
                        Batch Start
                      </label>
                      <input
                        type="number"
                        name="batchStart"
                        value={formData?.batchStart || ""}
                        onChange={handleChange}
                        className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block font-medium mb-1 text-gray-700">
                        Batch End
                      </label>
                      <input
                        type="number"
                        name="batchEnd"
                        value={formData?.batchEnd || ""}
                        onChange={handleChange}
                        className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                      />
                    </div>
                  </div>
                  {falseEndYear ? (
                    <div className="flex text-sm md:text-base justify-center md:items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height={isMobile ? "20px" : "24px"}
                        viewBox="0 -960 960 960"
                        width={isMobile ? "20px" : "24px"}
                        fill="#992B15"
                      >
                        <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                      </svg>
                      &nbsp; Graduation end year must be later than the start
                      year.
                    </div>
                  ) : null}
                  <div className="md:col-span-2">
                    <label className="block font-medium mb-1 text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    >
                      <option value="">Select...</option>
                      {[
                        "Placed",
                        "Higher Education",
                        "Entrepreneurship",
                        "Unplaced",
                      ].map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      value={formData?.linkedin || ""}
                      onChange={handleChange}
                      className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      GitHub
                    </label>
                    <input
                      type="text"
                      name="github"
                      value={formData?.github || ""}
                      onChange={handleChange}
                      className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                    />
                  </div>
                  <div>
                    <label className="  ">LeetCode</label>
                    <input
                      type="text"
                      name="leetcode"
                      value={formData?.leetcode || ""}
                      onChange={handleChange}
                      className="w-full max-w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200 box-border"
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer ${
                      isUpdating ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEdit(false);
                      setIsPreview(true);
                    }}
                    className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </section>
            </form>
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
