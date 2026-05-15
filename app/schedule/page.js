"use client";

import { Clock, CalendarDays, Users, Zap } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-white">Message Scheduling</h2>
        <p className="text-sm text-slate-400">Plan and automate outgoing WhatsApp broadcasts and reminders.</p>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/5 p-8 text-center backdrop-blur-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent/10 blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/30 bg-accent/10 shadow-[0_0_40px_rgba(var(--accent-rgb),0.2)]">
            <Clock className="h-10 w-10 text-accent" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Smart Scheduling Module</h3>
            <p className="max-w-md text-sm text-slate-400 mx-auto">
              This module is currently in development. Soon you will be able to program your AI to reach out proactively.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 w-full max-w-3xl">
            <FeatureCard 
              icon={<CalendarDays className="h-5 w-5 text-emerald-400" />}
              title="Time-Delay Replies"
              desc="Schedule follow-up messages automatically if a user hasn't replied."
            />
            <FeatureCard 
              icon={<Users className="h-5 w-5 text-blue-400" />}
              title="Targeted Broadcasts"
              desc="Send personalized updates to specific contacts at an exact time."
            />
            <FeatureCard 
              icon={<Zap className="h-5 w-5 text-amber-400" />}
              title="AI Campaigns"
              desc="Let the AI initiate conversations based on user tags or past history."
            />
          </div>

          <button className="mt-8 rounded-lg bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/20 hover:scale-105">
            Join Early Access
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-white/5 bg-slate-900/50 p-5 text-center transition hover:border-white/10 hover:bg-slate-900/80">
      <div className="mb-3 rounded-full bg-slate-800 p-2 border border-white/10">
        {icon}
      </div>
      <h4 className="mb-2 font-medium text-white text-sm">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
