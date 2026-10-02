"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Gift, Share2 } from "lucide-react";
// use the same import path as your dashboard

export function ReferralBanner({ referralUrl }: { referralUrl: string }) {
//   const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
    //   toast({ title: "Referral link copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
    //   toast({ title: "Couldn't copy, please copy it manually", variant: "destructive" });
    }
  };

  const share = async () => {
    const text = "Join me on Cerebre Plus, the AI marketing toolkit:";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Cerebre Plus", text, url: referralUrl });
        return;
      } catch {
        /* user cancelled, fall through to WhatsApp */
      }
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${referralUrl}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Gift className="h-4 w-4 shrink-0 text-yellow-400" />
        <span>Invite friends, earn coins</span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <input
          readOnly
          value={referralUrl}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Your referral link"
          className="min-w-0 flex-1 truncate rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
        />

        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-yellow-400"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>

        <button
          type="button"
          onClick={share}
          aria-label="Share referral link"
          className="shrink-0 rounded-md border border-white/10 p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}