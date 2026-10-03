"use client";
import { useAuth } from "@/context/AuthUserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../register/Register.module.css";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

export default function LogIn() {
  const { authUser, loading, signInWithGoogle, signInWithEmail, signOutUser } =
    useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const [isDisabled, setDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function check() {
      if (authUser) {
        const token = await authUser.getIdToken(true);
        try {
          const response = await axios.post(
            "/api/login",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (response.data.success) {
            if (response.data.role == "user") router.replace("/profile");
            if (response.data.role == "admin") router.replace("/admin");
          }
          return true;
        } catch (e) {
          console.error(e);
          return false;
        }
      }
    }
    check();
  }, [authUser, router]);

  const handleGoogleSignIn = async () => {
    try {
      setDisabled(true);
      const userCredential = await signInWithGoogle();
      const token = await userCredential.user.getIdToken();
      
      const IITP_REGEX = /^[a-zA-Z]+_[0-9]{4}[a-zA-Z]{2}[0-9]{2}@iitp\.ac\.in$/;
      if (IITP_REGEX.test(userCredential.user.email)) {
        toast.error("IITP College students are not allowed to login.");
        await signOutUser();
        setDisabled(false);
        return;
      }

      const response = await axios.post(
        "/api/login",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("Login successfully!");
        if (response.data.role == "user") router.push("/profile");
        if (response.data.role == "admin") router.push("/admin");
      } else {
        toast.error("Account not found. Please register first.");
        await signOutUser();
      }
    } catch (err) {
      console.error(err);
      if (err?.code === "auth/popup-closed-by-user") {
         toast.error("Google Sign-In was cancelled");
      } else {
         toast.error("Google Sign-In failed");
      }
    } finally {
      setDisabled(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDisabled(true);
    if (!formData.email || !formData.password) {
      toast.error("All fields are required!");
      setDisabled(false);
      return;
    }

    const IITP_REGEX = /^[a-zA-Z]+_[0-9]{4}[a-zA-Z]{2}[0-9]{2}@iitp\.ac\.in$/;
    const flag = IITP_REGEX.test(formData.email);
    if (flag) {
      toast.error("IITP College students are not allowed to login.");
      setDisabled(false);
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmail(
        formData.email,
        formData.password,
      );
      const token = await userCredential.user.getIdToken();
      const response = await axios.post(
        "/api/login",
        { name: formData.name },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("Login successfully!");
        router.push("/profile");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Login failed");
    } finally {
      setDisabled(false);
    }
  };

  if (loading) return <>loading</>;

  return (
    <div
      className={`bg-muted flex min-h-svh gap-8 items-center justify-center p-6 md:p-10 ${styles.background} text-white overflow-x-hidden`}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-full px-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full w-full p-2"
        >
          <h1 className="font-bold text-7xl text-grad p-2 race text-center">
            LOGIN
          </h1>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          className={`h-full w-full max-w-md sm:w-[90%] lg:w-[25vw] flex flex-col items-center gap-8 justify-center px-4 py-6 ${styles.glassCard}`}
        >
          <div className="flex flex-col gap-8 w-full">
            {/* Email */}
            <div className="flex flex-col gap-2 text-xl w-full">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter Your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="p-2 border-2 rounded-lg text-white w-full focus:outline-none focus:ring-0 focus:border-teal-600"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2 text-xl w-full">
              <label htmlFor="password">Password</label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="p-2 pr-10 border-2 rounded-lg text-white w-full focus:outline-none focus:ring-0 focus:border-teal-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Login button */}
          <button
            className={`${styles["btn"]} ${
              isDisabled ? "opacity-50" : ""
            } w-full`}
            type="submit"
            disabled={isDisabled}
          >
            {isDisabled ? "Logging In..." : "Login"}
          </button>

          <div className="flex items-center gap-4 w-full my-1">
             <hr className="flex-1 border-white/20" />
             <span className="text-white/50 text-sm">OR</span>
             <hr className="flex-1 border-white/20" />
          </div>

          <button
             type="button"
             onClick={handleGoogleSignIn}
             disabled={isDisabled}
             className="w-full flex items-center justify-center gap-2 p-2 border-2 border-teal-600 rounded-lg text-white hover:bg-teal-600/20 transition-colors"
          >
             <FcGoogle size={24} />
             Sign in with Google
          </button>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-md text-white hover:text-white/90 hover:underline transition-colors mt-2"
          >
            Don't have an account? 
            <p className="text-blue-400 inline ml-1">
              Register
            </p>
          </button>
        </motion.form>
      </div>
    </div>
  );
}
