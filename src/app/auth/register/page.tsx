"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Tooltip from "@/app/Tooltip/tooltip";
import Image from "next/image";
import logo from "@/assets/cleit.png";
import Footer from "../footer/page";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./page.css";

export default function Society() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    enrollmentNumber: "",
    collegeEmail: "",
    otp: "",
    phone: "",
    department: "",
    tenthPercentage: "",
    twelfthPercentage: "",
    collegeGPA: "",
    batchStart: "",
    batchEnd: "",
    linkedin: "",
    github: "",
    leetcode: "",
    resume: "",
    status: "",
    password: "",
    confirmPassword: "",
  });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/account");
      }
    });

    return () => unsubscribe();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [falseUsernameFormat, setFalseUsernameFormat] = useState(false);
  const [falseEmailFormat, setFalseEmailFormat] = useState(false);
  const [falsePasswordFormat, setFalsePasswordFormat] = useState(false);
  const [falseConfirmPassword, setFalseConfirmPassword] = useState(false);

  const [invalidOtp, setInvalidOtp] = useState(false);
  const [validOtp, setValidOtp] = useState(false);

  const [usernameAlreadyTaken, setUsernameAlreadyTaken] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [emailAlreadyTaken, setEmailAlreadyTaken] = useState(false);

  const [isNameEmpty, setIsNameEmpty] = useState(false);
  const [isPhoneNumberEmpty, setIsPhoneNumberEmpty] = useState(false);
  const [isEnrollmentNumberEmpty, setIsEnrollmentNumberEmpty] = useState(false);
  const [isUsernameEmpty, setIsUsernameEmpty] = useState(false);
  const [isDepartmentEmpty, setIsDepartmentEmpty] = useState(false);
  const [istenthPercentageEmpty, setIstenthPercentageEmpty] = useState(false);
  const [istwelfthPercentageEmpty, setIstwelfthPercentageEmpty] =
    useState(false);
  const [isCollegeCGPAEmpty, setIsCollegeCGPAEmpty] = useState(false);
  const [isStartYearEmpty, setIsStartYearEmpty] = useState(false);
  const [isEndYearEmpty, setIsEndYearEmpty] = useState(false);
  const [falseEndYear, setFalseEndYear] = useState(false);
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);
  const [isConfirmPasswordEmpty, setIsConfirmPasswordEmpty] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLinkedinUsernameEmpty, setIsLinkedinUsernameEmpty] = useState(false);
  const [isGithubUsernameEmpty, setIsGithubUsernameEmpty] = useState(false);
  const [isLeetcodeUsernameEmpty, setIsLeetcodeUsernameEmpty] = useState(false);
  const [isStatusEmpty, setIsStatusEmpty] = useState(false);
  const [checkingMail, setCheckingMail] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [isBasicDetails, setIsBasicDetails] = useState(true);
  const [isAcademicDetails, setIsAcademicDetails] = useState(false);
  const [isSocialDetails, setIsSocialDetails] = useState(false);

  const [usernameChecking, setUsernameChecking] = useState(false);

  const [remainingTime, setRemainingTime] = useState(120);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name == "name") {
      setIsNameEmpty(false);
    }
    if (name === "username") {
      setIsUsernameEmpty(false);
      setUsernameAvailable(false);
      setUsernameAlreadyTaken(false);
    }
    if (name === "collegeEmail") {
      setIsEmailEmpty(false);
      setEmailAlreadyTaken(false);
      setOtpSending(false);
      setOtpSent(false);
    }
    if (name == "password") {
      setIsPasswordEmpty(false);
    }
    if (name == "confirmPassword") {
      setIsConfirmPasswordEmpty(false);
    }
    if (name == "phone") {
      setIsPhoneNumberEmpty(false);
    }
    if (name === "enrollmentNumber") {
      setIsEnrollmentNumberEmpty(false);
    }
    if (name === "department") {
      setIsDepartmentEmpty(false);
    }
    if (name == "tenthPercentage") {
      setIstenthPercentageEmpty(false);
    }
    if (name == "twelfthPercentage") {
      setIstwelfthPercentageEmpty(false);
    }
    if (name == "collegeGPA") {
      setIsCollegeCGPAEmpty(false);
    }
    if (name == "batchStart") {
      setIsStartYearEmpty(false);
    }
    if (name == "batchEnd") {
      setIsEndYearEmpty(false);
    }
    if (name == "linkedin") {
      setIsLinkedinUsernameEmpty(false);
    }
    if (name == "github") {
      setIsGithubUsernameEmpty(false);
    }
    if (name == "leetcode") {
      setIsLeetcodeUsernameEmpty(false);
    }
    if (name == "status") {
      setIsStatusEmpty(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      formData.linkedin == "" ||
      formData.github == "" ||
      formData.leetcode == "" ||
      formData.status == ""
    ) {
      setIsLinkedinUsernameEmpty(formData.linkedin == "");
      setIsGithubUsernameEmpty(formData.github == "");
      setIsLeetcodeUsernameEmpty(formData.leetcode == "");
      setIsStatusEmpty(formData.status == "");
      return;
    }
    setIsSubmitting(true);
    setSuccess("");
    setError("");

    try {
      await createUserWithEmailAndPassword(
        auth,
        formData.collegeEmail,
        formData.password
      );
      const res = await axios.post("/api/register/user", formData);
      if (res.status === 200) {
        router.replace("/auth/login");
      }
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  async function isUsernameAvailable() {
    try {
      if (formData.username == "") return;
      setUsernameChecking(true);

      const res = await fetch(
        `/api/register/user?username=${formData.username}`
      );
      const data = await res.json();
      setUsernameChecking(false);

      if (data.usernameExists) {
        setUsernameAvailable(false);
        setUsernameAlreadyTaken(true);
      } else {
        setUsernameAlreadyTaken(false);
        setUsernameAvailable(true);
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }
  }
  async function sendEmailOtp() {
    try {
      if (falseEmailFormat) {
        return;
      }
      if (formData.collegeEmail == "") {
        return;
      }
      setCheckingMail(true);
      const res = await fetch(
        `/api/register/user?email=${formData.collegeEmail}`
      );
      const data = await res.json();
      setCheckingMail(false);

      if (data.emailExists) {
        setEmailAlreadyTaken(true);
      } else {
        setOtpSending(true);
        setEmailAlreadyTaken(false);
        const otpRes = await fetch("/api/otp/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.collegeEmail }),
        });

        const otpData = await otpRes.json();
        if (!otpRes.ok) {
          console.error("OTP error:", otpData.error);
        } else {
          setOtpSending(false);
          setOtpSent(true);
        }
      }
    } catch (error) {
      console.log("Error checking email or sending otp:", error);
    }
  }
  async function verifyOtp() {
    try {
      if (formData.otp == "") return;
      setVerifyingOtp(true);
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.collegeEmail,
          otp: formData.otp,
        }),
      });

      const data = await res.json();

      setVerifyingOtp(false);
      if (res.ok && data.verified) {
        setInvalidOtp(false);
        setValidOtp(true);
      } else {
        setValidOtp(false);
        setInvalidOtp(true);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    const {
      username,
      collegeEmail,
      password,
      confirmPassword,
      batchStart,
      batchEnd,
    } = formData;

    const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;
    setFalseUsernameFormat(username ? !usernameRegex.test(username) : false);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(vips\.edu|vipstc\.edu\.in)$/;
    setFalseEmailFormat(collegeEmail ? !emailRegex.test(collegeEmail) : false);

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    setFalsePasswordFormat(password ? !passwordRegex.test(password) : false);

    setFalseConfirmPassword(
      !!confirmPassword && !!password && confirmPassword !== password
    );
    setFalseEndYear(
      !!batchStart && !!batchEnd && Number(batchEnd) <= Number(batchStart)
    );
  }, [formData]);

  function handleNextToAcademicDetails() {
    if (
      formData.name == "" ||
      formData.username == "" ||
      formData.phone == "" ||
      formData.collegeEmail == "" ||
      formData.password == "" ||
      formData.confirmPassword == ""
    ) {
      setIsNameEmpty(formData.name == "");
      setIsUsernameEmpty(formData.username == "");
      setIsPhoneNumberEmpty(formData.phone == "");
      setIsEmailEmpty(formData.collegeEmail == "");
      setIsPasswordEmpty(formData.password == "");
      setIsConfirmPasswordEmpty(formData.confirmPassword == "");
      return;
    }
    if (!validOtp) return;
    setIsBasicDetails(false);
    setIsAcademicDetails(true);
  }

  function handleNextToSocialDetails() {
    if (
      formData.enrollmentNumber == "" ||
      formData.department == "" ||
      formData.tenthPercentage == "" ||
      formData.twelfthPercentage == "" ||
      formData.collegeGPA == "" ||
      formData.batchStart == "" ||
      formData.batchEnd == ""
    ) {
      setIsEnrollmentNumberEmpty(formData.enrollmentNumber == "");
      setIsDepartmentEmpty(formData.department == "");
      setIstenthPercentageEmpty(formData.twelfthPercentage == "");
      setIstwelfthPercentageEmpty(formData.twelfthPercentage == "");
      setIsCollegeCGPAEmpty(formData.collegeGPA == "");
      setIsStartYearEmpty(formData.batchStart == "");
      setIsEndYearEmpty(formData.batchEnd == "");
      return;
    }
    setIsAcademicDetails(false);
    setIsSocialDetails(true);
  }

  function handlePrevToBasicDetails() {
    setIsAcademicDetails(false);
    setIsBasicDetails(true);
  }

  function handlePrevToAcademicDetails() {
    setIsSocialDetails(false);
    setIsAcademicDetails(true);
  }

  useEffect(() => {
    if (!otpSending && !otpSent) {
      setRemainingTime(120);
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timer);
          setOtpSending(false);
          setOtpSent(false);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent]);

  return (
    <>
      <div className="flex justify-center onest-normal">
        <Image src={logo} width={isMobile ? 150 : 200} alt="cleit"></Image>
      </div>
      <div className="border-1 border-gray-200 mt-2"></div>
      <div className="w-[95%] lg:w-full max-w-4xl mx-auto font-sans mt-10">
        <div className="md:text-lg border border-gray-300 p-4 md:p-6 rounded-xl shadow-md bg-white mb-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Career Development Cell Registration
          </h1>

          <div className="w-full flex justify-center">
            <div className="flex items-center w-full md:w-2/3 mb-5 relative">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isBasicDetails
                      ? "bg-indigo-500 border-indigo-500 text-white shadow-lg"
                      : isAcademicDetails || isSocialDetails
                      ? "bg-green-500 border-green-500 text-white shadow-lg"
                      : "bg-white border-gray-300 text-gray-500"
                  }`}
                >
                  {isAcademicDetails || isSocialDetails ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="white"
                      viewBox="0 -960 960 960"
                    >
                      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                    </svg>
                  ) : (
                    "1"
                  )}
                </div>
                <span className="mt-2 text-sm font-medium">Basic Details</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isAcademicDetails
                      ? "bg-indigo-500 border-indigo-500 text-white shadow-lg"
                      : isSocialDetails
                      ? "bg-green-500 border-green-500 text-white shadow-lg"
                      : "bg-white border-gray-300 text-gray-500"
                  }`}
                >
                  {isSocialDetails ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="white"
                      viewBox="0 -960 960 960"
                    >
                      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                    </svg>
                  ) : (
                    "2"
                  )}
                </div>
                <span className="mt-2 text-sm font-medium">Academics</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isSocialDetails
                      ? "bg-indigo-500 border-indigo-500 text-white shadow-lg"
                      : "bg-white border-gray-300 text-gray-500"
                  }`}
                >
                  3
                </div>
                <span className="mt-2 text-sm font-medium">Social</span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          {success && (
            <p className="text-green-600 text-center mb-4">{success}</p>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-1 md:space-y-2 lg:space-y-4"
          >
            {isBasicDetails ? (
              <>
                <div>
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  {isNameEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter your name
                    </div>
                  ) : null}
                </div>
                <div>
                  <div className="flex items-center">
                    <div>
                      <label className="block mb-1 text-gray-700 font-medium mr-1">
                        Username
                      </label>
                    </div>
                    <div>
                      <Tooltip
                        content="Username must be 3–20 characters long and can only contain letters, numbers, dot, or underscores"
                        position="top"
                      >
                        <svg
                          className="mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          height="18px"
                          viewBox="0 -960 960 960"
                          width="18px"
                          fill="#141414"
                        >
                          <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                        </svg>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <span className="px-3 text-gray-600">@</span>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="yourusername"
                      className="flex-1 py-2 outline-none w-[70%] lg:w-[80%]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        isUsernameAvailable();
                      }}
                      disabled={falseUsernameFormat || usernameChecking}
                      className={`bg-indigo-500 outline-none w-[30%] lg:w-[20%] text-white px-1 md:px-2 lg:px-4 py-2 rounded-r-md hover:bg-indigo-700 ${
                        usernameChecking
                          ? "cursor-not-allowed opacity-50"
                          : "hover:cursor-pointer"
                      } ${
                        falseUsernameFormat
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:cursor-pointer"
                      }`}
                    >
                      {usernameChecking ? "Checking" : "Check"}
                    </button>
                  </div>
                  {isUsernameEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter username
                    </div>
                  ) : null}
                </div>
                {usernameAlreadyTaken ? (
                  <div className="flex text-sm md:text-base justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="22px"
                      viewBox="0 -960 960 960"
                      width="22px"
                      fill="#992B15"
                    >
                      <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                    </svg>
                    &nbsp; Username already taken
                  </div>
                ) : null}
                {usernameAvailable ? (
                  <div className="flex text-sm md:text-base justify-center items-center bg-green-500 text-[#264d0fff] rounded px-3 text-center py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#264d0fff"
                    >
                      <path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z" />
                    </svg>
                    &nbsp; Username available
                  </div>
                ) : null}
                {falseUsernameFormat ? (
                  <div className="flex text-sm md:text-base justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="22px"
                      viewBox="0 -960 960 960"
                      width="22px"
                      fill="#992B15"
                    >
                      <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                    </svg>
                    &nbsp; Please enter a valid username
                  </div>
                ) : null}
                <div>
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  {isPhoneNumberEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter your phone number
                    </div>
                  ) : null}
                </div>
                <div>
                  <label className="block mb-1 text-gray-700 font-medium">
                    VIPS Email Address
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <input
                      type="email"
                      name="collegeEmail"
                      value={formData.collegeEmail}
                      onChange={handleChange}
                      placeholder="you@vips.edu / you@vipstc.edu.in"
                      className="flex-1 px-4 py-2 outline-none w-[70%] lg:w-[80%]"
                    />
                    <button
                      type="button"
                      onClick={() => sendEmailOtp()}
                      disabled={otpSent || otpSending || checkingMail}
                      className={`bg-indigo-500 outline-none w-[30%] lg:w-[20%] text-white px-1 md:px-2 lg:px-4 py-2 rounded-r-md hover:bg-indigo-700 ${
                        otpSent || otpSending || checkingMail
                          ? "hover:cursor-not-allowed opacity-50"
                          : "hover:cursor-pointer"
                      }`}
                    >
                      {otpSending
                        ? "Sending"
                        : checkingMail
                        ? isMobile
                          ? "Checking"
                          : "Checking Mail"
                        : otpSent
                        ? "Sent"
                        : "Send OTP"}
                    </button>
                  </div>
                  {otpSent ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      Didn&apos;t receive OTP? Send again&nbsp;in{" "}
                      {remainingTime} seconds
                    </div>
                  ) : null}
                  {isEmailEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter your email
                    </div>
                  ) : null}
                </div>

                {emailAlreadyTaken ? (
                  <div className="flex text-sm md:text-base justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="22px"
                      viewBox="0 -960 960 960"
                      width="22px"
                      fill="#992B15"
                    >
                      <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                    </svg>
                    &nbsp; Email ID already in use
                  </div>
                ) : null}
                {falseEmailFormat ? (
                  <div className="flex text-sm md:text-base justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="22px"
                      viewBox="0 -960 960 960"
                      width="22px"
                      fill="#992B15"
                    >
                      <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                    </svg>
                    &nbsp; Please enter a valid email address
                  </div>
                ) : null}
                <div>
                  <label className="block mb-1 text-gray-700 font-medium">
                    Enter OTP
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="123456"
                      className="flex-1 px-4 py-2 outline-none w-[70%] lg:w-[80%]"
                    />
                    <button
                      type="button"
                      disabled={validOtp || verifyingOtp}
                      onClick={verifyOtp}
                      className={`bg-indigo-500 outline-none w-[30%] lg:w-[20%] text-white px-1 md:px-2 lg:px-4 py-2 rounded-r-md hover:bg-indigo-700 hover:cursor-pointer ${
                        validOtp || verifyingOtp
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:cursor-pointer"
                      }`}
                    >
                      {verifyingOtp ? "Verifying" : "Verify"}
                    </button>
                  </div>
                </div>
                {invalidOtp ? (
                  <div className="flex text-sm md:text-base justify-center md:items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="22px"
                      viewBox="0 -960 960 960"
                      width="22px"
                      fill="#992B15"
                    >
                      <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                    </svg>
                    &nbsp; The entered OTP is invalid. Kindly verify and
                    re-enter.
                  </div>
                ) : null}
                {validOtp ? (
                  <div className="flex text-sm md:text-base justify-center items-center bg-green-500 text-[#264d0fff] rounded px-3 text-center py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#264d0fff"
                    >
                      <path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z" />
                    </svg>
                    &nbsp; OTP verified successfully
                  </div>
                ) : null}
                <div className="flex-1 space-y-1 md:flex gap-4">
                  <div className="flex-1">
                    <div>
                      <div className="flex items-center">
                        <div>
                          <label className="block mb-1 text-gray-700 font-medium mr-1">
                            Password
                          </label>
                        </div>
                        <div>
                          <Tooltip
                            content="Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, #, $, !, %, *, ?, &)."
                            position="top"
                          >
                            <svg
                              className="mr-2"
                              xmlns="http://www.w3.org/2000/svg"
                              height="18px"
                              viewBox="0 -960 960 960"
                              width="18px"
                              fill="#141414"
                            >
                              <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                            </svg>
                          </Tooltip>
                        </div>
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••"
                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                      />
                    </div>
                    {isPasswordEmpty ? (
                      <div className="text-sm flex text-[#8C1A10] mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="18px"
                          viewBox="0 -960 960 960"
                          width="18px"
                          fill="#8C1A10"
                        >
                          <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                        </svg>
                        &nbsp; Please enter password
                      </div>
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <div>
                      <div className="flex items-center">
                        <label className="block mb-1 text-gray-700 font-medium">
                          Confirm Password&nbsp;
                        </label>
                        <svg
                          onClick={() =>
                            setIsPasswordVisible(!isPasswordVisible)
                          }
                          xmlns="http://www.w3.org/2000/svg"
                          height="20px"
                          viewBox="0 -960 960 960"
                          width="20px"
                          fill="#000000"
                        >
                          <path
                            d={
                              isPasswordVisible
                                ? "M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"
                                : "m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"
                            }
                          />
                        </svg>
                      </div>
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder={
                          isPasswordVisible ? "superstrongpassword" : "••••••"
                        }
                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                      />
                    </div>
                    {isConfirmPasswordEmpty ? (
                      <div className="text-sm flex text-[#8C1A10] mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="18px"
                          viewBox="0 -960 960 960"
                          width="18px"
                          fill="#8C1A10"
                        >
                          <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                        </svg>
                        &nbsp; Please enter confirm password
                      </div>
                    ) : null}
                  </div>
                </div>
                {falsePasswordFormat ? (
                  <div className="flex text-sm md:text-base justify-center md:items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="22px"
                      viewBox="0 -960 960 960"
                      width="22px"
                      fill="#992B15"
                    >
                      <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                    </svg>
                    &nbsp; Please enter a valid password format
                  </div>
                ) : null}
                {falseConfirmPassword ? (
                  <div className="flex justify-center items-center bg-red-300 text-red-800 rounded px-3 text-center py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="22px"
                      viewBox="0 -960 960 960"
                      width="22px"
                      fill="#992B15"
                    >
                      <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
                    </svg>
                    &nbsp; Passwords do not match.
                  </div>
                ) : null}

                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleNextToAcademicDetails();
                    }}
                    className={`hover:cursor-pointer w-full bg-indigo-500 outline-none text-white px-6 py-2 rounded-md font-semibold transition hover:bg-indigo-700
                      `}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : null}

            {isAcademicDetails ? (
              <>
                <div>
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">
                      Enrollment Number
                    </label>
                    <input
                      type="text"
                      name="enrollmentNumber"
                      value={formData.enrollmentNumber}
                      onChange={handleChange}
                      placeholder="Enter your enrollment number"
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  {isEnrollmentNumberEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter your enrollment number
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block mb-1 text-gray-700 font-medium">
                    Department & Branch
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
                  {isDepartmentEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please select your department
                    </div>
                  ) : null}
                </div>
                <div>
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">
                      Tenth Percentage
                    </label>
                    <input
                      type="number" step="any"
                      name="tenthPercentage"
                      value={formData.tenthPercentage}
                      onChange={handleChange}
                      placeholder="Your Percentage in 10th"
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  {istenthPercentageEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter your 10th Percentage
                    </div>
                  ) : null}
                </div>

                <div>
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">
                      Twelfth Percentage
                    </label>
                    <input
                      type="number" step="any"
                      name="twelfthPercentage"
                      value={formData.twelfthPercentage}
                      onChange={handleChange}
                      placeholder="Your Percentage in 12th"
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  {istwelfthPercentageEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter your 12th Percentage
                    </div>
                  ) : null}
                </div>

                <div>
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">
                      College GPA till now
                    </label>
                    <input
                      type="number" step="any"
                      name="collegeGPA"
                      value={formData.collegeGPA}
                      onChange={handleChange}
                      placeholder="College GPA"
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  {isCollegeCGPAEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter your college GPA
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <div>
                      <label className="block mb-1 text-gray-700 font-medium">
                        Start Year
                      </label>
                      <input
                        type="number"
                        name="batchStart"
                        value={formData.batchStart}
                        onChange={handleChange}
                        placeholder="2023"
                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                      />
                    </div>
                    {isStartYearEmpty ? (
                      <div className="text-sm flex text-[#8C1A10] mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="18px"
                          viewBox="0 -960 960 960"
                          width="18px"
                          fill="#8C1A10"
                        >
                          <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                        </svg>
                        &nbsp;
                        {isMobile
                          ? "Required"
                          : "Please enter graduation start year"}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <div>
                      <label className="block mb-1 text-gray-700 font-medium">
                        End Year
                      </label>
                      <input
                        type="number"
                        name="batchEnd"
                        value={formData.batchEnd}
                        onChange={handleChange}
                        placeholder="2027"
                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                      />
                    </div>
                    {isEndYearEmpty ? (
                      <div className="text-sm flex text-[#8C1A10] mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="18px"
                          viewBox="0 -960 960 960"
                          width="18px"
                          fill="#8C1A10"
                        >
                          <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                        </svg>
                        &nbsp;
                        {isMobile
                          ? "Required"
                          : "Please enter graduation end year"}
                      </div>
                    ) : null}
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

                <div>
                  <div className="flex gap-4 justify-center">
                    <div className="text-center mt-3 w-full">
                      <button
                        onClick={() => handlePrevToBasicDetails()}
                        type="button"
                        className={`flex hover:cursor-pointer items-center justify-center w-full bg-indigo-500 outline-none text-white px-6 py-2 rounded-md font-semibold transition hover:bg-indigo-700 `}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#ffffff"
                        >
                          <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                        </svg>
                        &nbsp; {isMobile ? "Back" : "Previous"}
                      </button>
                    </div>
                    <div className="text-center mt-3 w-full">
                      <button
                        type="button"
                        onClick={() => {
                          handleNextToSocialDetails();
                        }}
                        className={`flex hover:cursor-pointer justify-center items-center w-full bg-indigo-500 outline-none text-white px-6 py-2 rounded-md font-semibold transition hover:bg-indigo-700 `}
                      >
                        Next&nbsp;
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#ffffff"
                        >
                          <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {isSocialDetails ? (
              <>
                <div>
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">
                      LinkedIn Username
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="Enter your LinkedIn Username"
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  {isLinkedinUsernameEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter your LinkedIn Username
                    </div>
                  ) : null}
                </div>
                <div>
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">
                      Github Username
                    </label>
                    <input
                      type="text"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      placeholder="Enter your Github Username"
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  {isGithubUsernameEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter your Github Username
                    </div>
                  ) : null}
                </div>
                <div>
                  <div>
                    <label className="block mb-1 text-gray-700 font-medium">
                      Leetcode Username
                    </label>
                    <input
                      type="text"
                      name="leetcode"
                      value={formData.leetcode}
                      onChange={handleChange}
                      placeholder="Enter your Leetcode Username"
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  {isLeetcodeUsernameEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please enter your Leetcode Username
                    </div>
                  ) : null}
                </div>
                <div>
                  <label className="block mb-1 text-gray-700 font-medium">
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
                  {isStatusEmpty ? (
                    <div className="text-sm flex text-[#8C1A10] mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="18px"
                        viewBox="0 -960 960 960"
                        width="18px"
                        fill="#8C1A10"
                      >
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
                      &nbsp; Please select your status
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className="flex gap-4 justify-center">
                    <div className="text-center mt-3 w-full">
                      <button
                        onClick={() => handlePrevToAcademicDetails()}
                        type="button"
                        className={`flex hover:cursor-pointer items-center justify-center w-full bg-indigo-500 outline-none text-white px-6 py-2 rounded-md font-semibold transition hover:bg-indigo-700 `}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#ffffff"
                        >
                          <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                        </svg>
                        &nbsp; {isMobile ? "Back" : "Previous"}
                      </button>
                    </div>
                    <div className="text-center mt-3 w-full">
                      <button
                        type="submit"
                        className={`flex justify-center items-center w-full bg-indigo-500 outline-none text-white px-6 py-2 rounded-md font-semibold transition hover:bg-indigo-700 ${
                          isSubmitting
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:cursor-pointer"
                        }`}
                      >
                        {isSubmitting ? "Submitting" : "Submit"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </form>
        </div>
        <div className="text-center mb-8">
          Already have an account?&nbsp;
          <Link href={"/auth/login"}>
            <u>Login now.</u>
          </Link>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
