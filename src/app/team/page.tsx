"use client";
import React, { useMemo, useState, } from "react";
import { teamData, TeamMember } from "./teamData";
import "./teams.css";
import DevelopersPanel from "./Developers";



interface TeamNode extends TeamMember {
  children: TeamNode[];
}



// Build tree from flat data
const buildTeamTree = (data: TeamMember[]): TeamNode[] => {
  const map: { [key: string]: TeamNode } = {};

  // Initialize map
  data.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  const roots: TeamNode[] = [];

  // Connect children to parents
  data.forEach((item) => {
    if (item.parentId === null) {
      roots.push(map[item.id]);
    } else if (map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    }
  });

  return roots;
};

// Component to render a single card
const MemberCard = ({ member }: { member: TeamNode }) => {
  const isConvenor = member.parentId === "convenors" || member.parentId === "fest-coords";
  const hideTitle = member.parentId === "fest-coords" || member.parentId === "convenors";

  return (
    <div className={`node-card-wrapper ${isConvenor ? 'yellow-card' : ''}`}>
      <div className="node-card-border"></div>
      <div className="node-card-content">

        <div className="node-image-container">
          {member.image && member.image !== "#" ? (
            <img className="node-image" src={member.image} alt={member.name} />
          ) : (
            <img
              className="node-image"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=000&color=fff&size=512&font-size=0.35&length=2&bold=true`}
              alt={member.name}
            />
          )}
          {/* Overlay for readability at bottom of image area */}
          <div className="node-image-overlay"></div>
        </div>

        <div className="node-info">
          <div className="node-name">{member.name}</div>
          {!hideTitle && <div className="node-title">{member.title}</div>}
        </div>

        <div className="node-social-links">
          {member.linkedin && member.linkedin !== "#" && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
              <img src="/images/linkedin.svg" alt="LinkedIn" className="social-icon" />
            </a>
          )}
          {member.x && member.x !== "#" && (
            <a href={member.x} target="_blank" rel="noopener noreferrer">
              <img src="/images/instagram.svg" alt="X" className="social-icon" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
};

// Recursive component to render sections
const TeamSection = ({ node, level = 0 }: { node: TeamNode; level?: number }) => {
  // Separate children into groups (nodes that have children or are purely structural) and members (leaf nodes)
  // Heuristic: If it has children, it's a group. If it has no children, it's a member.
  // HOWEVER, some "Members" might be leaf nodes in the data but not structurally "people" if data is missing.
  // But typically in this dataset, people are leaves.
  // Exception: "Tech Team" has children, but is also a group.

  // Let's iterate and separate.
  // But wait, "Coordinators" group has children (Hospitality, etc) and "Hospitality" has children (People).
  // We want to render:
  // Heading: Node Name
  // Grid of direct people children
  // Sub-sections of group children

  const { members, groups } = useMemo(() => {
    const members: TeamNode[] = [];
    const groups: TeamNode[] = [];

    node.children.forEach(child => {
      // Check if child is a "person" or a "subgroup"
      // In teamData, people usually don't have children. 
      // Groups like "Hospitality" have children.
      // But "Celesta-Team" has "Fest Convenors" (Group).
      if (child.children.length > 0) {
        groups.push(child);
      } else {
        // It has no children. It might be a person.
        // Or empty group. Assuming person for now based on data.
        members.push(child);
      }
    });
    return { members, groups };
  }, [node]);

  // Don't render the root container title "Team Celesta" if we want to be clean, 
  // currently the page has "Our Team" h1. 
  // But purely recursive is fine.

  if (level === 0 && node.id === "Celesta-Team") {
    // Just render children for root to avoid double title
    return (
      <div className="w-full">
        {members.length > 0 && (
          <div className="members-grid mb-16">
            {members.map(member => <MemberCard key={member.id} member={member} />)}
          </div>
        )}
        {groups.map(group => <TeamSection key={group.id} node={group} level={level + 1} />)}
      </div>
    );
  }


  return (
    <div className={`team-section `}>
      <h2 className={`team-section-title ${node.id === 'convenors' || node.id === 'fest-coords' ? 'yellow-title' : ''}`}>{node.name}</h2>

      {/* If it's the tech section, maybe add a subtitle or decoration? */}

      {members.length > 0 && (
        <div className="members-grid">
          {members.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <div className="mt-8">
          {groups.map(group => (
            <TeamSection key={group.id} node={group} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function TeamsPage() {
  const rootNodes = useMemo(() => buildTeamTree(teamData), []);

  return (
    <main className="teams-page relative min-h-screen">
      <div className="fixed inset-0 z-0 text-white">
        <img
          src="/images/backdrop.png"
          alt="Background"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-black/60"></div> {/* Dark Overlay */}
        <div className="absolute inset-0 z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,white_100%)]">
          <svg className="absolute inset-0 h-full w-full text-white" aria-hidden="true">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"></rect>
          </svg>
        </div>
      </div>

      <div className="relative z-20 container mx-auto px-4">
        <h1 className="race font-bold text-5xl md:text-7xl text-center mb-12 mt-[15vh] bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 w-full uppercase">TEAM</h1>

        {rootNodes.map(root => (
          <TeamSection key={root.id} node={root} />
        ))}
      </div>

      <DevelopersPanel />

    </main>
  );
}