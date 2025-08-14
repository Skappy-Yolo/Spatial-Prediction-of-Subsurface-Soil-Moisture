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
    <section className="border rounded-lg p-4">
      <h2 className="font-medium mb-3">Live Comments</h2>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 rounded border px-3 py-2 text-sm bg-transparent"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share feedback..."
        />
        <button className="px-3 py-2 text-sm rounded border bg-foreground text-background" onClick={addComment}>
          Send
        </button>
      </div>
      {!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
        <p className="text-sm text-gray-500">Realtime disabled. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border rounded p-3">
              <div className="text-xs text-gray-500 mb-1">
                {c.author} • {new Date(c.created_at).toLocaleString()}
              </div>
              <div className="text-sm whitespace-pre-wrap">{c.message}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}


