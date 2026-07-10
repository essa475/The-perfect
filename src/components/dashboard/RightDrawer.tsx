import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { GlassCard, RippleBtn, Icons } from "./primitives";
import DevOptions from "./DevOptions";

type SubTab = "profile" | "dev";

function ProfileSection({ username, onLogout }: { username: string; onLogout: () => void }) {
  return (
    <GlassCard glow="amber" className="p-5 space-y-4">
      {/* Avatar row */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-black/30 border border-white/6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-300 font-black text-xl">
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-black text-white text-base">{username}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400/80">Active session</span>
          </div>
        </div>
      </div>

      {/* Info bullets */}
      <div className="space-y-2 px-1">
        {[
          "Spread & curve data is saved locally on this device.",
          "Session auto-expires after 24 hours of inactivity.",
          "Password: XAUUSD  (shared access key)",
        ].map((t, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-slate-500">
            <span className="text-amber-500/40 mt-0.5 text-xs">◆</span> {t}
          </div>
        ))}
      </div>

      <RippleBtn
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 text-red-400 font-bold py-3 text-sm transition-all active:scale-[0.98]"
      >
        <Icons.Logout />
        Log Out
      </RippleBtn>
    </GlassCard>
  );
}

export default function RightDrawer({
  open,
  onOpenChange,
  username,
  onLogout,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  username: string;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<SubTab>("profile");

  const TABS: { id: SubTab; label: string; emoji: string }[] = [
    { id: "profile", label: "Profile",    emoji: "👤" },
    { id: "dev",     label: "Dev Options", emoji: "⚙️" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="border-white/10 text-slate-100 w-[90%] sm:max-w-sm overflow-y-auto smooth-scroll"
        style={{ backgroundColor: "var(--app-bg, #06070e)" }}
      >
        <SheetHeader>
          <SheetTitle className="text-white font-black tracking-tight">Account</SheetTitle>
        </SheetHeader>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-black/40 mt-3 mb-4 border border-white/5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 ${
                tab === t.id ? "text-slate-950 shadow-md" : "text-slate-500 hover:text-slate-300"
              }`}
              style={
                tab === t.id
                  ? {
                      background:
                        "linear-gradient(135deg, var(--app-button, #f59e0b), var(--app-button-light, #fbbf24))",
                    }
                  : undefined
              }
            >
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div key={tab} className="space-y-4 card-in">
          {tab === "profile" && <ProfileSection username={username} onLogout={onLogout} />}
          {tab === "dev"     && <DevOptions />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
