"use client";
import { useAuth } from "@/context/AuthUserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Register.module.css";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function Register() {
  const { authUser, loading, signUpWithEmail } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: { day: "", month: "", year: "" },
  });

  const [isDisabled, setDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!otpSent || canResend) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [otpSent, canResend]);


  useEffect(() => {
    async function check() {
      if (!authUser) return;
      const token = await authUser.getIdToken(true);

      try {
        const res = await axios.post(
          "/api/register",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          if (res.data.role === "user") router.replace("/profile");
          if (res.data.role === "admin") router.replace("/admin");
        }
      } catch { }
    }
    check();
  }, [authUser, router]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setDisabled(true);

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("All fields are required!");
      setDisabled(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      setDisabled(false);
      return;
    }

    const IITP_REGEX = /^[a-zA-Z]+_[0-9]{4}[a-zA-Z]{2}[0-9]{2}@iitp\.ac\.in$/;
    const flag = IITP_REGEX.test(formData.email);

    if (flag) {
      toast.error("IITP College students are not allowed to register.");
      setDisabled(false);
      return;
    }

    try {
      await axios.post("/api/send-otp", { email: formData.email });

      toast.success("OTP sent to email");
      setOtpSent(true);
      setResendTimer(30);
      setCanResend(false);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setDisabled(false);
    }
  };

  const verifyOtpAndRegister = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setDisabled(true);

      try {
        await axios.post("/api/verify-otp", {
          email: formData.email,
          otp: otp,
        });
      } catch (verifyError) {
        toast.error(verifyError.response?.data?.message || "Invalid OTP");
        setDisabled(false);
        return;
      }

      const userCredential = await signUpWithEmail(
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      const token = await user.getIdToken();
      const dobString = `${formData.dob.year}-${formData.dob.month}-${formData.dob.day}`;
      try {
        const response = await axios.post(
          "/api/register",
          { name: formData.name, dob: dobString },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!response.data.success) {
          throw new Error("Profile creation failed");
        }

        toast.success("Registered successfully!");
        router.push("/profile");
      } catch (apiError) {
        await user.delete();
        console.error(
          "Rollback executed: Orphaned auth user deleted.",
          apiError,
        );
        toast.error(
          "Registration failed during profile setup. Please try again.",
        );
      }
    } catch (error) {
      if (error?.code === "auth/email-already-in-use") {
        toast.error("This email is already registered! Please log in.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setDisabled(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const resendOtp = async () => {
    try {
      await axios.post("/api/send-otp", { email: formData.email });
      toast.success("OTP resent");
      setResendTimer(30);
      setCanResend(false);
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  if (loading) return <>Loading...</>;

  return (
    <div
      className={`p-4 md:p-10 bg-muted ${styles.background} text-white min-h-svh flex flex-col items-center justify-center overflow-x-hidden`}
    >
      <motion.div
        initial={{ opacity: 0, x: -140 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-full"
      >
        <h1 className="font-bold text-5xl md:text-6xl text-grad race mt-16 p-2 text-center md:text-left">
          Register
        </h1>
      </motion.div>

      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-full md:max-w-4xl flex flex-col gap-8 p-4 md:p-10 ${styles.glassCard}`}
      >
        {otpSent && (
          <div className="mb-4 px-4 py-2 rounded-lg bg-red-500/20 border border-red-400 text-red-300 text-sm md:text-base">
            📩 If you haven't received the OTP, please check your
            <b> Spam / Junk</b> folder.
          </div>
        )}

        {!otpSent && (
          <>
            <div className="flex gap-10 justify-between flex-wrap">
              <div className="flex flex-col gap-6 flex-1 min-w-[250px]">
                <div className="flex flex-col gap-2 text-xl">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="p-2 border-2 rounded-lg text-white bg-transparent focus:outline-none focus:border-teal-600"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 text-xl">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="p-2 border-2 rounded-lg text-white bg-transparent focus:outline-none focus:border-teal-600"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 text-xl w-full">
                  <label>Password</label>
                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="p-2 pr-10 border-2 rounded-lg text-white w-full bg-transparent focus:outline-none focus:border-teal-600"
                      placeholder="Minimum 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 flex-1 min-w-[250px]">
                <div className="flex flex-col gap-2 text-xl">
                  <label>Date of Birth</label>
                  <div className="flex gap-3 flex-wrap">
                    {["day", "month", "year"].map((f) => (
                      <input
                        key={f}
                        type="text"
                        maxLength={f === "year" ? 4 : 2}
                        placeholder={
                          f === "day" ? "DD" : f === "month" ? "MM" : "YYYY"
                        }
                        value={formData.dob[f]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dob: { ...formData.dob, [f]: e.target.value },
                          })
                        }
                        className="w-20 p-2 border-2 rounded-lg text-white bg-transparent outline-none focus:border-teal-600"
                        required
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-xl w-full">
                  <label>Confirm Password</label>
                  <div className="relative w-full">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="p-2 pr-10 border-2 rounded-lg text-white w-full bg-transparent focus:outline-none focus:border-teal-600"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className={`mx-auto ${styles.btn} ${isDisabled && "opacity-50"}`}
            >
              {isDisabled ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {otpSent && (
          <div className="flex flex-col gap-4 mt-6 items-center">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full max-w-xs p-2 border-2 rounded-lg text-white bg-transparent focus:outline-none focus:border-teal-600"
            />

            <button
              type="button"
              onClick={verifyOtpAndRegister}
              disabled={isDisabled}
              className={`${styles.btn} ${isDisabled && "opacity-50"}`}
            >
              Register
            </button>

            {!canResend ? (
              <p className="text-sm opacity-70">Resend OTP in {resendTimer}s</p>
            ) : (
              <button
                type="button"
                onClick={resendOtp}
                className="underline text-sm"
              >
                Resend OTP
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
