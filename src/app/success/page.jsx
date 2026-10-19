
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { Suspense } from "react";

function StatusMessage() {
  const success = useSearchParams().get("status") === "success";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      {success ? (
        <CheckCircle className="mb-4 h-16 w-16 text-teal-400" />
      ) : (
        <XCircle className="mb-4 h-16 w-16 text-red-500" />
      )}

      <h1 className="mb-3 text-3xl font-bold">
        {success ? "Payment Successful" : "Payment Failed"}
      </h1>

      <p className="mb-8 text-gray-400">
        {success
          ? "Your purchases/registrations are available in your profile."
          : "Your payment could not be completed. Please try again or contact at given details."}
      </p>

      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-zinc-800 px-6 py-3 hover:bg-zinc-700"
        >
          Home
        </Link>

        <Link
          href={success ? "/profile" : "/store"}
          className={`rounded-md px-6 py-3 ${
            success
              ? "bg-teal-500 hover:bg-teal-400 text-black"
              : "bg-red-600 hover:bg-red-500"
          }`}
        >
          {success ? "Profile" : "Store"}
        </Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          Loading...
        </main>
      }
    >
      <StatusMessage />
    </Suspense>
  );
}
