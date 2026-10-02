"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Theme } from "emoji-picker-react";
import { SmilePlus, Star } from "lucide-react";

// Picker is heavy, so load it only when someone opens it
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const QUICK = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

type Item = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reactions: Record<string, number>;
  mine: string | null;
};
type Data = {
  items: Item[];
  stats: { avg: number; total: number; distribution: number[] };
};
type Burst = { id: number; emoji: string; x: number; y: number };

// Mirrors the server logic so the UI updates instantly
function applyReaction(item: Item, emoji: string): Item {
  const reactions = { ...item.reactions };
  const dec = (e: string) => {
    if (!reactions[e]) return;
    reactions[e] -= 1;
    if (reactions[e] <= 0) delete reactions[e];
  };
  if (item.mine) dec(item.mine);
  if (item.mine === emoji) return { ...item, reactions, mine: null };
  reactions[emoji] = (reactions[emoji] ?? 0) + 1;
  return { ...item, reactions, mine: emoji };
}

// Stable gradient per feedback id for the avatar orb
function orb(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `conic-gradient(from 0deg, hsl(${h} 90% 60%), hsl(${(h + 80) % 360} 90% 60%), hsl(${h} 90% 60%))`;
}

export default function FeedbackWall() {
  const [data, setData] = useState<Data | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/feedback");
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const react = useCallback(
    async (id: string, emoji: string, origin: { x: number; y: number }) => {
      const item = data?.items.find((i) => i.id === id);
      if (item && item.mine !== emoji) {
        const burst = { id: Date.now() + Math.random(), emoji, ...origin };
        setBursts((b) => [...b, burst]);
        setTimeout(() => setBursts((b) => b.filter((x) => x.id !== burst.id)), 900);
      }

      // Optimistic update
      setData((d) =>
        d && { ...d, items: d.items.map((i) => (i.id === id ? applyReaction(i, emoji) : i)) }
      );

      const res = await fetch(`/api/feedback/${id}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) load(); // roll back to server truth
    },
    [data, load]
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060f] px-4 py-16 text-white">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/30 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-500/25 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-violet-600/25 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">Cerebre Plus</p>
          <h1 className="mt-2 bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-violet-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Signal from our users
          </h1>
        </header>

        {data && <StatsPanel stats={data.stats} />}

        <section className="mt-10 flex flex-col gap-4">
          {!data && (
            <div className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          )}

          {data?.items.length === 0 && (
            <p className="text-center text-white/50">No feedback yet. Be the first.</p>
          )}

          {data?.items.map((item) => (
            <FeedbackCard key={item.id} item={item} onReact={react} />
          ))}
        </section>
      </div>

      {/* Floating emoji bursts */}
      {bursts.map((b) => (
        <span
          key={b.id}
          className="animate-float-up pointer-events-none fixed z-50 text-3xl"
          style={{ left: b.x, top: b.y }}
        >
          {b.emoji}
        </span>
      ))}
    </main>
  );
}

function StatsPanel({ stats }: { stats: Data["stats"] }) {
  return (
    <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6  md:grid-cols-[auto_1fr]">
      <div className="text-center md:text-left">
        <div className="bg-gradient-to-br from-yellow-200 to-amber-400 bg-clip-text text-6xl font-bold text-transparent">
          {stats.avg.toFixed(1)}
        </div>
        <div className="mt-1 flex justify-center gap-0.5 text-amber-300 md:justify-start">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`h-4 w-4 ${n <= Math.round(stats.avg) ? "fill-amber-300" : "opacity-30"}`}
            />
          ))}
        </div>
        <p className="mt-1 text-sm text-white/50">{stats.total} ratings</p>
      </div>

      <div className="flex flex-col justify-center gap-2">
        {stats.distribution.map((count, i) => {
          const pct = stats.total ? (count / stats.total) * 100 : 0;
          return (
            <div key={i} className="flex items-center gap-3 text-xs text-white/60">
              <span className="w-3">{5 - i}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.8)] transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeedbackCard({
  item,
  onReact,
}: {
  item: Item;
  onReact: (id: string, emoji: string, origin: { x: number; y: number }) => void;
}) {
  const [trayOpen, setTrayOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const pick = (emoji: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    onReact(item.id, emoji, { x: r.left + r.width / 2, y: r.top });
    setTrayOpen(false);
    setPickerOpen(false);
  };

  const entries = Object.entries(item.reactions).sort((a, b) => b[1] - a[1]);

  return (
    <article className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:border-fuchsia-400/40 hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.6)]">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 shrink-0 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)]"
          style={{ background: orb(item.id) }}
        />
        <div className="flex-1">
          <div className="flex gap-0.5 text-amber-300">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-4 w-4 ${n <= item.rating ? "fill-amber-300" : "opacity-25"}`}
              />
            ))}
          </div>
          <p className="text-xs text-white/40">
            {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {item.comment && <p className="mt-3 text-sm leading-relaxed text-white/80">{item.comment}</p>}

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        {entries.map(([emoji, count]) => (
          <button
            key={emoji}
            type="button"
            onClick={(e) => pick(emoji, e.currentTarget)}
            aria-pressed={item.mine === emoji}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition hover:scale-105 ${
              item.mine === emoji
                ? "border-cyan-400/70 bg-cyan-400/15 shadow-[0_0_14px_rgba(34,211,238,0.5)]"
                : "border-white/10 bg-white/5"
            }`}
          >
            <span>{emoji}</span>
            <span className="text-xs text-white/70">{count}</span>
          </button>
        ))}

        <button
          type="button"
          aria-label="Add reaction"
          onClick={() => {
            setTrayOpen((o) => !o);
            setPickerOpen(false);
          }}
          className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/60 transition hover:text-white"
        >
          <SmilePlus className="h-4 w-4" />
        </button>

        {/* WhatsApp-style quick tray */}
        {trayOpen && (
          <>
            <button
              type="button"
              aria-label="Close"
              className="fixed inset-0 z-20 cursor-default"
              onClick={() => {
                setTrayOpen(false);
                setPickerOpen(false);
              }}
            />
            <div className="absolute bottom-full left-0 z-30 mb-2 flex items-center gap-1 rounded-full border border-white/15 bg-[#0b0d1f]/95 px-2 py-1.5 shadow-xl backdrop-blur-xl">
              {QUICK.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={(e) => pick(emoji, e.currentTarget)}
                  className="rounded-full px-1.5 text-2xl transition hover:-translate-y-1 hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                aria-label="More emoji"
                onClick={() => setPickerOpen((o) => !o)}
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg hover:bg-white/20"
              >
                +
              </button>
            </div>

            {pickerOpen && (
              <div className="absolute bottom-full left-0 z-30 mb-14">
                <EmojiPicker
                  theme={"dark" as Theme}
                  lazyLoadEmojis
                  width={320}
                  height={380}
                  onEmojiClick={(e, ev) => pick(e.emoji, ev.target as HTMLElement)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}