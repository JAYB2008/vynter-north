import Link from "next/link";
import { Sparkles, Shield, Cpu, Film } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#08080F] text-[#F1F5F9] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Top Logo */}
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30 group-hover:bg-[#6D28D9] transition-all duration-200">
            <span className="font-black text-white text-lg tracking-tighter">VN</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-[#A78BFA] transition-colors">
            Vynter <span className="text-[#A78BFA]">North</span>
          </span>
        </Link>
      </div>

      {/* Auth Card Container: Two-column on desktop */}
      <div className="w-full max-w-4xl bg-[#14142A] border border-[#1E1E3A] rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Decorative Panel */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#1C1C35] via-[#14142A] to-[#0F0F1A] p-8 flex-col justify-between border-r border-[#1E1E3A] relative overflow-hidden">
          {/* Subtle Glow circles */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#A78BFA]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-xs font-semibold text-[#A78BFA]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Character Intelligence Layer</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
              Consistent characters for AI video productions.
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Register original character identities once. Inject deep behavioral nuances across Claude, ChatGPT, Runway, and Kling.
            </p>
          </div>

          <div className="relative z-10 space-y-3 pt-6 border-t border-[#1E1E3A]">
            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
              <div className="w-6 h-6 rounded-md bg-[#7C3AED]/20 flex items-center justify-center text-[#A78BFA]">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span>Verified Creator IP & Studio Renting</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
              <div className="w-6 h-6 rounded-md bg-[#7C3AED]/20 flex items-center justify-center text-[#A78BFA]">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span>MCP Protocol Connection Standard</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
              <div className="w-6 h-6 rounded-md bg-[#7C3AED]/20 flex items-center justify-center text-[#A78BFA]">
                <Film className="w-3.5 h-3.5" />
              </div>
              <span>Automated Scene Prompt Behavioral Enrichment</span>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
