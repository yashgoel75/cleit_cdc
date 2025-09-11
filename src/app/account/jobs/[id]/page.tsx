"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/Header/page";
import Footer from "@/app/Footer/page";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getFirebaseToken } from "@/utils";

export default function JobDetails() {
  interface StudentApplication {
    email: string; // Firebase auth email
    responses: {
      fieldName: string;
      value: string | number | File; // depends on input type
    }[];
    appliedAt: string; // ISO date string
  }

  interface inputField {
    fieldName: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }
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
    studentsApplied?: StudentApplication[];
    pdfUrl: string;
    extraFields?: { fieldName: string; fieldValue: string }[];
    inputFields?: {
      fieldName: string;
      type: string;
      placeholder?: string;
      required?: boolean;
      options?: string[];
    }[];
  }

  const { id } = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [formData, setFormData] = useState<
    Record<string, string | number | File>
  >({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchJob = async (jobId: string) => {
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to fetch job details.");
      setJob(data.job);

      // Check if current user has already applied
      if (
        data.job.studentsApplied?.some(
          (app: StudentApplication) => app.email === currentUser?.email
        )
      ) {
        setApplied(true);
      }

      // Initialize form data with empty values
      if (data.job.inputFields) {
        const initialFormData: Record<string, string | number | File> = {};
        data.job.inputFields.forEach((field: inputField) => {
          initialFormData[field.fieldName] = field.type === "number" ? 0 : "";
        });
        setFormData(initialFormData);
      }

      setError(null);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    fieldName: string,
    value: string | number | File
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error for this field when user starts typing
    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!job?.inputFields) return true;

    const errors: Record<string, string> = {};

    job.inputFields.forEach((field) => {
      if (field.required) {
        const value = formData[field.fieldName];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          errors[field.fieldName] = `${field.fieldName} is required`;
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [isStudentApplied, setIsStudentApplied] = useState(false);
  useEffect(() => {
    const isAlreadyApplied = () => {
      if (!currentUser?.email || !job) return false;
      setIsStudentApplied(
        job.studentsApplied?.some((app) => app.email === currentUser?.email) ||
          false
      );
    };
    isAlreadyApplied();
  }, [job, currentUser]);

  const handleApply = async () => {
    if (!currentUser?.email || !id) return;

    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    setApplying(true);
    try {
      const token = await getFirebaseToken();
      const responses = Object.entries(formData).map(([fieldName, value]) => ({
        fieldName,
        value,
      }));

      const application: StudentApplication = {
        email: currentUser.email,
        responses,
        appliedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(application),
      });

      if (!res.ok) throw new Error("Failed to apply.");

      // FIXED: Set the correct state upon successful application.
      setApplied(true);
    } catch (err) {
      console.error(err);
      alert("There was a problem submitting your application.");
    } finally {
      setApplying(false);
    }
  };

  const renderInputField = (field: inputField) => {
    const value = formData[field.fieldName] || "";
    const hasError = formErrors[field.fieldName];

    switch (field.type) {
      case "text":
        return (
          <div key={field.fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value as string}
              onChange={(e) =>
                handleInputChange(field.fieldName, e.target.value)
              }
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                hasError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{hasError}</p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value as number}
              onChange={(e) =>
                handleInputChange(
                  field.fieldName,
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                hasError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{hasError}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value as string}
              onChange={(e) =>
                handleInputChange(field.fieldName, e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                hasError ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select {field.fieldName}</option>
              {field.options?.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{hasError}</p>
            )}
          </div>
        );

      case "file":
        return (
          <div key={field.fieldName} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleInputChange(field.fieldName, file);
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                hasError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{hasError}</p>
            )}
          </div>
        );

      default:
        return null;
    }
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
      <main className="w-[95%] lg:w-full max-w-5xl mx-auto px-4 py-10 md:py-16 min-h-[85vh]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 border-t-indigo-500 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl animate-pulse">📋</span>
                </div>
              </div>
              <p className="text-xl text-gray-600 font-medium">
                Loading job details...
              </p>
              <p className="text-gray-500 mt-2">
                Please wait while we fetch the information
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg text-center">
              <span className="text-6xl mb-4 block">😔</span>
              <p className="text-red-700 font-bold text-lg mb-2">
                Oops! Something went wrong
              </p>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => id && fetchJob(id as string)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : !job ? (
          <div className="flex items-center justify-center py-20">
            <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto shadow-lg text-center">
              <span className="text-8xl mb-6 block">🔍</span>
              <p className="text-2xl text-gray-700 font-bold mb-3">
                Job not found
              </p>
              <p className="text-gray-500 text-lg mb-6">
                The job you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
              <button
                onClick={() => router.back()}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
            {/* Header Section */}
            <div className="bg-white rounded-md p-8 relative overflow-hidden">
              <div className="relative z-10 text-center">
                <h1 className="text-3xl text-indigo-500 md:text-4xl font-bold mb-4">
                  {job.company}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-6 rounded-full py-3 bg-indigo-50">
                  <div className="flex items-center">
                    <span className="mr-2">Role:</span>
                    <span className="font-semibold">{job.role}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">Location:</span>
                    <span className="font-semibold">{job.location}</span>
                  </div>
                  {job.studentsApplied && job.studentsApplied.length > 0 && (
                    <div className="flex items-center">
                      <span className="mr-2">Number of Applications:</span>
                      <span className="font-semibold">
                        {job.studentsApplied.length} applicants
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Key Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">⏰</div>
                  <div className="text-sm text-gray-600 mb-1">
                    Application Deadline
                  </div>
                  <div className="font-bold text-gray-800">
                    {job.deadline
                      ? new Date(job.deadline).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "No deadline specified"}
                  </div>
                  {(() => {
                    const deadlineStatus = getDeadlineStatus(job.deadline);
                    return (
                      deadlineStatus && (
                        <div
                          className={`mt-2 px-2 py-1 rounded-full text-xs font-bold ${
                            deadlineStatus.color === "red"
                              ? "bg-red-100 text-red-800"
                              : deadlineStatus.color === "orange"
                              ? "bg-orange-100 text-orange-800"
                              : deadlineStatus.color === "yellow"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {deadlineStatus.text}
                        </div>
                      )
                    );
                  })()}
                </div>

                {job.postedAt && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-sm text-gray-600 mb-1">Posted On</div>
                    <div className="font-bold text-gray-800">
                      {new Date(job.postedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                )}

                {/* <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">💼</div>
                  <div className="text-sm text-gray-600 mb-1">Job Type</div>
                  <div className="font-bold text-gray-800">Full-time</div>
                </div> */}
              </div>

              {/* Extra Fields Section */}
              {job.extraFields && job.extraFields.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    Job Highlights
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {job.extraFields.map((field, index) => (
                      <div
                        key={index}
                        className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 hover:bg-indigo-100 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">
                            {field.fieldName}:
                          </span>
                          <span className="text-indigo-600 font-bold">
                            {field.fieldValue.startsWith(
                              "https://res.cloudinary.com"
                            ) ? (
                              <a href={field.fieldValue} target="_blank">
                                View PDF
                              </a>
                            ) : (
                              field.fieldValue
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  Job Description
                </h2>
                <div className="border border-gray-200 rounded-xl p-3">
                  <div
                    className="text-gray-700 leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </div>
              </div>

              {/* Eligibility Criteria */}
              {job.eligibility && job.eligibility.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="bg-indigo-100 p-2 rounded-lg mr-3">
                      📝
                    </span>
                    Eligibility Criteria
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <ul className="space-y-3">
                      {job.eligibility.map((criterion, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-500 mr-3 mt-1">✓</span>
                          <span className="text-gray-700">{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* PDF Link */}
              {job.jobDescriptionPdf && (
                <div className="mb-8">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-3">📄</div>
                    <h3 className="font-bold text-gray-800 mb-2">
                      Detailed Job Description
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Download the complete job description for more details
                    </p>
                    <a
                      href={job.jobDescriptionPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 cursor-pointer shadow-lg hover:shadow-xl"
                    >
                      <span className="mr-2">📥</span>
                      Download PDF
                    </a>
                  </div>
                </div>
              )}

              {/* Application Form Section */}
              {job.inputFields && job.inputFields.length > 0 && !applied && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="bg-indigo-100 p-2 rounded-lg mr-3">
                      📝
                    </span>
                    Application Form
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    {job.inputFields.map((field) => renderInputField(field))}
                  </div>
                </div>
              )}

              {/* Application Section */}
              <div className="">
                <div className="flex flex-col md:flex-row justify-center gap-6">
                  {job.linkToApply && (
                    <a
                      href={job.linkToApply}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`bg-green-500 text-white px-5 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                        isStudentApplied
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:bg-green-700"
                      }`}
                    >
                      Apply on Company Website
                    </a>
                  )}
                  <button
                    onClick={handleApply}
                    disabled={applying || applied}
                    className={`bg-indigo-500 text-white px-5 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                      isStudentApplied
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-indigo-700"
                    }`}
                  >
                    {applying ? (
                      <>
                        Submitting...
                      </>
                    ) : isStudentApplied || applied ? (
                      <>Application Submitted</>
                    ) : (
                      <>Apply Now</>
                    )}
                  </button>
                </div>
              </div>

              {/* Back Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => router.back()}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200 cursor-pointer flex items-center mx-auto"
                >
                  <span className="mr-2">←</span>
                  Back to Jobs
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
