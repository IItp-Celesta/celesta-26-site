"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HiCodeBracket } from "react-icons/hi2";
import { developersData, TeamMember } from "./teamData";

interface TeamNode extends TeamMember {
  children: TeamNode[];
}

// Component to render a single card
const MemberCard = ({ member }: { member: TeamNode }) => {
  return (
    <div className="node-card-wrapper">
      <div className="node-card-border"></div>
      <div className="node-card-content">

        <div className="node-image-container">
          {member.image && member.image !== "#" ? (
            <Image className="node-image" src={member.image} alt={member.name} fill sizes="300px" />
          ) : (
            <Image
              className="node-image"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=000&color=fff&size=512&font-size=0.35&length=2&bold=true`}
              alt={member.name}
              fill
              sizes="300px"
            />
          )}
          {/* Overlay for readability at bottom of image area */}
          <div className="node-image-overlay"></div>
        </div>

        <div className="node-info">
          <div className="node-name">{member.name}</div>
          <div className="node-title">{member.title}</div>
        </div>

        <div className="node-social-links">
          {member.linkedin && member.linkedin !== "#" && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
              <Image src="/images/linkedin.svg" alt="LinkedIn" width={24} height={24} className="social-icon" />
            </a>
          )}
          {member.x && member.x !== "#" && (
            <a href={member.x} target="_blank" rel="noopener noreferrer">
              <Image src="/images/instagram.svg" alt="X" width={24} height={24} className="social-icon" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
};

// ---------- Developers Panel ----------
export default function DevelopersPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Lock background scroll */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  /* Mobile: scroll expands bottom sheet */
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const handleScroll = () => {
      if (window.innerWidth >= 1024) return; // desktop ignores this

      const scrollTop = panel.scrollTop;
      const start = window.innerHeight * 0.5;
      const translateY = Math.max(0, start - scrollTop);

      panel.style.transform = `translateY(${translateY}px)`;
    };

    panel.addEventListener("scroll", handleScroll);
    return () => panel.removeEventListener("scroll", handleScroll);
  }, [open]);

  return (
    <>
      {/* Floating Icon */}
      <button className="dev-fab glow-btn" onClick={() => setOpen(true)}>
        <span className="inner"></span>
        <HiCodeBracket className="dev-icon" />
      </button>

      {open && (
        <div className="dev-overlay" onClick={() => setOpen(false)}>
          <div
            ref={panelRef}
            className="dev-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="dev-close text-white" onClick={() => setOpen(false)}>
              ✕
            </button>

            <h2 className="team-section-title"><span></span>Developers</h2>

            <div className="members-grid">
              {developersData.map((dev) => (
                <MemberCard key={dev.id} member={{ ...dev, children: [] }} />
              ))}
            </div>
          </div>
        </div >
      )
      }
    </>
  );
}
