"use client";

import { useState } from "react";

type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: Date;
};

export default function ProjectDashboard() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  function handleAddComment() {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: crypto.randomUUID(),
      author: "Guest",
      text: newComment.trim(),
      createdAt: new Date(),
    };
    setComments((prev) => [comment, ...prev]);
    setNewComment("");
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-2">
        Spatial Prediction of Subsurface Soil Moisture
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Prototype dashboard. Replace with real data integrations as they
        become available.
      </p>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Model Overview</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Region: Demo AOI</li>
            <li>Resolution: 1km grid</li>
            <li>Temporal: Weekly</li>
            <li>Version: v0.1</li>
          </ul>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Latest Metrics</h2>
          <div className="text-sm grid grid-cols-2 gap-2">
            <div className="rounded bg-gray-50 dark:bg-gray-900 p-3">
              RMSE
              <div className="text-lg font-semibold">0.142</div>
            </div>
            <div className="rounded bg-gray-50 dark:bg-gray-900 p-3">
              R²
              <div className="text-lg font-semibold">0.82</div>
            </div>
            <div className="rounded bg-gray-50 dark:bg-gray-900 p-3">
              MAE
              <div className="text-lg font-semibold">0.091</div>
            </div>
            <div className="rounded bg-gray-50 dark:bg-gray-900 p-3">
              Coverage
              <div className="text-lg font-semibold">96%</div>
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Actions</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              className="px-3 py-2 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-900"
              onClick={() => alert("Trigger retraining (stub)")}
            >
              Retrain Model
            </button>
            <button
              className="px-3 py-2 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-900"
              onClick={() => alert("Export predictions (stub)")}
            >
              Export Predictions
            </button>
          </div>
        </div>
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="font-medium mb-3">Comments</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share feedback..."
            className="flex-1 rounded border px-3 py-2 text-sm bg-transparent"
          />
          <button
            className="px-3 py-2 text-sm rounded border bg-foreground text-background"
            onClick={handleAddComment}
          >
            Add
          </button>
        </div>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="border rounded p-3">
                <div className="text-xs text-gray-500 mb-1">
                  {c.author} • {c.createdAt.toLocaleString()}
                </div>
                <div className="text-sm whitespace-pre-wrap">{c.text}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}


