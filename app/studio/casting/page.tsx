"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Film, Plus, Users, Check, X, Mail, Loader2 } from "lucide-react";
import { CastingCall, CastingApplication } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export default function StudioCastingPage() {
  const [calls, setCalls] = useState<CastingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [applications, setApplications] = useState<CastingApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // New Call Form state
  const [showNewCall, setShowNewCall] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [minTier, setMinTier] = useState("newcomer");
  const [submittingCall, setSubmittingCall] = useState(false);

  const loadCalls = () => {
    apiFetch<{ calls: CastingCall[] }>("/api/casting").then((res) => {
      setLoading(false);
      if (res.ok && res.data.calls) {
        setCalls(res.data.calls);
        if (res.data.calls.length > 0 && !selectedCallId) {
          loadApplications(res.data.calls[0].id);
        }
      }
    });
  };

  const loadApplications = async (callId: string) => {
    setSelectedCallId(callId);
    setLoadingApps(true);
    const res = await apiFetch<{ applications: CastingApplication[] }>(
      `/api/casting/${callId}/applications`
    );
    setLoadingApps(false);
    if (res.ok && res.data.applications) {
      setApplications(res.data.applications);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmittingCall(true);

    const res = await apiFetch<any>("/api/casting", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        budget_cents: Math.round((parseFloat(budget) || 0) * 100),
        min_tier: minTier,
      }),
    });

    setSubmittingCall(false);
    if (res.ok) {
      setShowNewCall(false);
      setTitle("");
      setDescription("");
      setBudget("");
      loadCalls();
    }
  };

  // Section 7.8 Actions: Shortlist / Decline / Invite to rent
  const handleAppAction = async (appId: string, action: "shortlist" | "decline" | "invite", charId?: string) => {
    if (!selectedCallId) return;
    await apiFetch(`/api/casting/${selectedCallId}/applications`, {
      method: "PATCH",
      body: JSON.stringify({
        application_id: appId,
        action,
        character_id: charId,
      }),
    });
    loadApplications(selectedCallId);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--glacier)]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[var(--line)] gap-4">
        <div>
          <span className="text-xs font-mono text-[var(--glacier)] uppercase tracking-wider">
            Studio Production
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)] mt-1">
            Manage Casting Calls
          </h1>
          <p className="text-xs text-[var(--text-dim)] mt-1">
            Post production briefs and review auditioning character talent.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewCall(!showNewCall)}
          className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded-[6px] hover:brightness-110 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Post Casting Brief
        </button>
      </div>

      {showNewCall && (
        <form
          onSubmit={handleCreateCall}
          className="p-6 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] space-y-4 text-xs shadow-sm"
        >
          <h3 className="font-serif text-2xl text-[var(--text)]">
            New Casting Brief
          </h3>
          <div>
            <label className="block text-[var(--text)] font-semibold mb-1 uppercase tracking-wider">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lead Antagonist for Cyberpunk Thriller Short"
              className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
            />
          </div>

          <div>
            <label className="block text-[var(--text)] font-semibold mb-1 uppercase tracking-wider">
              Role & Scene Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe persona requirements, speaking cadence, physical intensity..."
              className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--text)] font-semibold mb-1 uppercase tracking-wider">
                Budget ($)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 150"
                className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)] font-mono"
              />
            </div>
            <div>
              <label className="block text-[var(--text)] font-semibold mb-1 uppercase tracking-wider">
                Minimum Tier
              </label>
              <select
                value={minTier}
                onChange={(e) => setMinTier(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--panel-raised)] border border-[var(--line)] rounded text-xs text-[var(--text)] uppercase"
              >
                <option value="newcomer">Newcomer</option>
                <option value="rising">Rising</option>
                <option value="established">Established</option>
                <option value="veteran">Veteran</option>
                <option value="legend">Legend</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewCall(false)}
              className="px-3 py-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingCall}
              className="px-4 py-2 bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold rounded hover:brightness-110"
            >
              Publish Brief
            </button>
          </div>
        </form>
      )}

      {/* Calls & Applicant Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Calls Column (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block">
            Casting Briefs ({calls.length})
          </span>
          {calls.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => loadApplications(c.id)}
              className={`w-full p-4 rounded-[8px] border text-left text-xs space-y-1.5 transition-colors ${
                selectedCallId === c.id
                  ? "bg-[var(--panel-raised)] border-[var(--glacier)]"
                  : "bg-[var(--panel)] border-[var(--line)] hover:border-[var(--line)]"
              }`}
            >
              <span className="font-serif text-lg text-[var(--text)] block leading-tight">
                {c.title}
              </span>
              <p className="text-[var(--text-dim)] line-clamp-2">
                {c.description}
              </p>
              <span className="text-[10px] text-[var(--text-dim)] font-mono block">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>

        {/* Applicants Column (7 cols) */}
        <div className="md:col-span-7 bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--glacier)]" />
              Auditioning Characters ({applications.length})
            </span>
          </div>

          {loadingApps ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--glacier)]" />
            </div>
          ) : applications.length === 0 ? (
            <p className="text-xs text-[var(--text-dim)] italic py-8 text-center">
              No characters have applied to this casting brief yet.
            </p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const char = app.character;
                return (
                  <div
                    key={app.id}
                    className="p-4 bg-[var(--panel-raised)] border border-[var(--line)] rounded-[8px] space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {char?.portrait_url && (
                          <img
                            src={char.portrait_url}
                            alt={char.name}
                            className="w-10 h-12 object-cover rounded-[2px] border border-[var(--line)]"
                          />
                        )}
                        <div>
                          <Link
                            href={`/characters/${app.character_id}`}
                            className="font-serif text-base text-[var(--text)] hover:text-[var(--glacier)] block leading-tight"
                          >
                            {char?.name || app.character_id}
                          </Link>
                          <span className="font-mono text-[10px] text-[var(--text-dim)]">
                            {app.character_id} • Status: {app.status}
                          </span>
                        </div>
                      </div>

                      {/* Section 7.8 Actions: Shortlist / Decline / Invite to rent */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAppAction(app.id, "shortlist")}
                          className="px-2.5 py-1 rounded bg-[var(--panel)] border border-[var(--line)] text-xs text-[var(--text)] hover:border-[var(--glacier)]"
                        >
                          Shortlist
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAppAction(app.id, "invite", app.character_id)}
                          className="px-2.5 py-1 rounded bg-[var(--glacier)] text-[var(--glacier-ink)] text-xs font-semibold hover:brightness-110 flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" /> Invite to rent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAppAction(app.id, "decline")}
                          className="p-1 text-[var(--bad)] hover:opacity-75"
                          title="Decline"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {app.message && (
                      <p className="text-[var(--text-dim)] italic bg-[var(--panel)] p-2.5 rounded">
                        "{app.message}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
