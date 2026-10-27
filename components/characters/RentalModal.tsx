"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Check,
  Sparkles,
  Bot,
  X,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Character, RentalType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface RentalModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
}

export function RentalModal({ character, isOpen, onClose }: RentalModalProps) {
  const router = useRouter();
  const { user, role, isAuthenticated } = useAuth();
  const [selectedTier, setSelectedTier] = useState<RentalType>(
    character.is_free ? "free" : "monthly"
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const tiers = [
    {
      id: "trial" as RentalType,
      name: "3-Day Trial",
      price: 0,
      credits: 15,
      period: "3 days",
      badge: "Free Trial",
    },
    {
      id: "daily" as RentalType,
      name: "Daily Rental",
      price: character.rental_price_daily,
      credits: 50,
      period: "per day",
    },
    {
      id: "weekly" as RentalType,
      name: "Weekly Rental",
      price: character.rental_price_weekly,
      credits: 200,
      period: "per week",
    },
    {
      id: "monthly" as RentalType,
      name: "Monthly Rental",
      price: character.rental_price_monthly,
      credits: 500,
      period: "per month",
      popular: true,
    },
  ];

  if (character.purchase_price) {
    tiers.push({
      id: "purchase" as RentalType,
      name: "Permanent Purchase",
      price: character.purchase_price,
      credits: 99999,
      period: "one-time",
      badge: "Exclusive",
    });
  }

  const handleActivate = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/marketplace/${character.id}`);
      return;
    }

    if (role === "creator") {
      toast.error(
        "You are currently logged in as a Creator. Switch to Studio role to rent characters."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character_id: character.id,
          rental_type: selectedTier,
          account_key: user?.account_key,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to activate rental");
      }

      toast.success(`Rental activated for ${character.name}!`);
      onClose();
      router.push(
        `/dashboard/connect?success=true&character=${encodeURIComponent(
          character.name
        )}`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to complete rental");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="vn-card w-full max-w-lg p-6 bg-card-app border-app shadow-2xl relative flex flex-col gap-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-app hover:text-primary-app hover:bg-elevated-app"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-[#A78BFA]">
            <ShieldCheck className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-app">
              Rent {character.name}
            </h3>
            <p className="text-xs text-secondary-app">
              {character.id} • Verified Character Skill Profile
            </p>
          </div>
        </div>

        {/* Tier Selection */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-app">
            Select Rental Tier
          </span>
          <div className="grid grid-cols-1 gap-2">
            {tiers.map((t) => {
              const isSelected = selectedTier === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTier(t.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-[#7C3AED] bg-purple-500/10 shadow-sm"
                      : "border-app bg-elevated-app hover:border-app/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-[#7C3AED] bg-[#7C3AED]"
                          : "border-muted-app"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary-app">
                          {t.name}
                        </span>
                        {t.popular && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#7C3AED] text-white">
                            Popular
                          </span>
                        )}
                        {t.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            {t.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-app">
                        {t.credits > 50000 ? "Unlimited" : t.credits} generation credits
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-primary-app">
                      {t.price === 0 ? "Free" : formatCurrency(t.price)}
                    </span>
                    <span className="text-[11px] text-muted-app block">
                      {t.period}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What You Get */}
        <div className="p-3.5 rounded-xl bg-elevated-app border border-app flex flex-col gap-2 text-xs">
          <span className="font-bold text-primary-app flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Included With Your Rental</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-secondary-app text-[11px]">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Full MCP token for Claude & ChatGPT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>NVIDIA NIM scene enrichment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Commercial video rights (Runway / Kling)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Permanent personality consistency</span>
            </div>
          </div>
        </div>

        {/* Beta Notice as specified */}
        <div className="px-3.5 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          <p className="font-semibold">Beta Access Notice:</p>
          <p className="text-[11px] text-amber-200/80 mt-0.5">
            Payment system integration in progress. During beta, character activations
            are processed instantly with full generation credits.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleActivate}
          disabled={loading}
          className="vn-button-primary w-full py-3 text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span>Activating Character Access...</span>
          ) : (
            <>
              <span>Activate Rental</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
