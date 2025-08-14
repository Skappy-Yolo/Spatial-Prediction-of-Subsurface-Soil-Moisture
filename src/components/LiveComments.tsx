"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, type RealtimePostgresInsertPayload } from "@supabase/supabase-js";

type CommentRow = {
  id: string;
  channel: string;
  author: string;
  message: string;
  created_at: string;
};

type Props = {
  channel: string;
};

export default function LiveComments({ channel }: Props) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [input, setInput] = useState("");
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (typeof window === "undefined") return null as unknown as ReturnType<typeof createClient>;
    if (!url || !anon) return null as unknown as ReturnType<typeof createClient>;
    return createClient(url, anon);
  }, []);

  useEffect(() => {
    let active = true;
    if (!supabase) return () => {};
    async function load() {
      const { data } = await supabase
        .from("comments")
        .select("id, channel, author, message, created_at")
        .eq("channel", channel)
        .order("created_at", { ascending: false })
        .limit(50);
      if (active && data) setComments(data as CommentRow[]);
    }
    load();

    const sub = supabase
      .channel(`realtime:comments:${channel}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `channel=eq.${channel}` },
        (payload: RealtimePostgresInsertPayload<CommentRow>) => {
          setComments((prev) => [payload.new as CommentRow, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase?.removeChannel(sub);
    };
  }, [channel, supabase]);

  async function addComment() {
    const text = input.trim();
    if (!text) return;
    if (!supabase) return;
    await supabase.from("comments").insert({
      channel,
      author: "Guest",
      message: text,
    });
    setInput("");
  }

  return (
    <section className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-[#111]"><!-- visible container -->
      <h2 className="font-medium mb-3 text-black dark:text-white">Live Comments</h2>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 rounded border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-[#111] text-black dark:text-white placeholder:text-gray-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share feedback..."
        />
        <button className="px-3 py-2 text-sm rounded border bg-foreground text-background" onClick={addComment}>
          Send
        </button>
      </div>
      {!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">Realtime disabled. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border border-gray-300 dark:border-gray-700 rounded p-3 bg-white dark:bg-[#111]">
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                {c.author} • {new Date(c.created_at).toLocaleString()}
              </div>
              <div className="text-sm whitespace-pre-wrap text-black dark:text-white">{c.message}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}


