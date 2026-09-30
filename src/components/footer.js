import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <div className="relative z-50 w-full bg-black text-white px-6 md:px-24 py-8 md:py-16 flex flex-col md:flex-row items-center md:items-center md:justify-between gap-8">

      {/* Logo */}
      <div className="flex justify-center md:justify-start w-full md:w-auto">
        <Image src="/images/banner-logo.svg" alt="banner-logo" width={400} height={600} className="object-contain" />
      </div>

      {/* Links */}
      <div className="flex flex-col justify-center items-center md:items-end  gap-4 text-center md:text-righto">
        <Link href="https://www.instagram.com/celestaiitp_official/">
          <span className="flex items-center gap-2 text-xl justify-center md:justify-end">
            <Instagram /> celestaiitp_official
          </span>
        </Link>
        <Link href="https://www.linkedin.com/company/celesta-iit-patna/">
          <span className="flex items-center gap-2 text-xl justify-center md:justify-end">
            <Linkedin /> celesta-iit-patna
          </span>
        </Link>
      </div>

    </div>
  );
}
