import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-app bg-card-app py-12 text-sm text-secondary-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white text-xs font-black shadow-sm">
              VN
            </div>
            <span className="font-extrabold text-base tracking-tight text-primary-app">
              VYNTER <span className="accent-purple">NORTH</span>
            </span>
          </div>
          <p className="text-sm text-secondary-app max-w-md">
            The Character Intelligence Layer for AI Entertainment. Register once,
            enrich dynamically through MCP in Claude and ChatGPT for consistent
            video generation.
          </p>
          <p className="text-xs text-muted-app mt-2">
            &copy; {new Date().getFullYear()} Vynter North. All rights reserved.
          </p>
        </div>

        {/* Right Column Links */}
        <div className="flex flex-wrap md:justify-end gap-x-8 gap-y-3 font-medium text-sm">
          <Link
            href="/marketplace"
            className="hover:text-primary-app hover:text-[#7C3AED] transition-colors"
          >
            Marketplace
          </Link>
          <Link
            href="/skills"
            className="hover:text-primary-app hover:text-[#7C3AED] transition-colors"
          >
            Skills
          </Link>
          <Link
            href="/demo"
            className="hover:text-primary-app hover:text-[#7C3AED] transition-colors"
          >
            Demo
          </Link>
          <Link
            href="/connect"
            className="hover:text-primary-app hover:text-[#7C3AED] transition-colors"
          >
            Connect
          </Link>
          <Link
            href="/terms"
            className="hover:text-primary-app hover:text-[#7C3AED] transition-colors text-muted-app"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="hover:text-primary-app hover:text-[#7C3AED] transition-colors text-muted-app"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
