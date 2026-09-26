"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from "@/context/AuthUserContext";
import { useRouter } from "next/navigation";

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { authUser, loading, signOutUser } = useAuth();
  const menuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div ref={menuRef} className="hidden lg:flex fixed top-24 right-4 sm:right-8 z-[60] group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white
                   flex items-center justify-center shadow-lg hover:bg-black/60 transition-all duration-300"
        aria-label="Toggle navigation menu"
      >
        <Image
          src="/images/celesta-icon.svg"
          alt="Celesta Menu"
          width={45}
          height={45}
          className={`w-8 h-8 md:w-[45px] md:h-[45px] transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>
      <div
        className={`absolute right-full top-0 mr-4 w-48 p-2 rounded-xl shadow-2xl
                    bg-black/60 backdrop-blur-lg border border-white/10
                    transition-all duration-300 ease-in-out origin-top-right
                    ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <nav className="flex flex-col space-y-1">
          {authUser && <Link href="/profile" onClick={() => setIsOpen(false)} className="px-4 py-2 text-white rounded-md hover:bg-white/10 transition-colors">
            Profile
          </Link>
          }
          <Link href="/contact" onClick={() => setIsOpen(false)} className="px-4 py-2 text-white rounded-md hover:bg-white/10 transition-colors">
            Contact Us
          </Link>
          <Link href="/store" onClick={() => setIsOpen(false)} className="px-4 py-2 text-white rounded-md hover:bg-white/10 transition-colors">
            Store
          </Link>
          {authUser &&

            <button onClick={async () => {
              await signOutUser();
              router.push("/register");
            }} className="px-4 py-2 text-white rounded-md hover:bg-white/10 transition-colors text-left">
              Log Out
            </button>
          }

        </nav>
      </div>
    </div>
  );
}

