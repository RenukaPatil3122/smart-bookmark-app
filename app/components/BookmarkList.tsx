"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at: string;
  user_id: string;
};

export default function BookmarkList({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[];
  userId: string;
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const bc = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // BroadcastChannel for cross-tab sync
    bc.current = new BroadcastChannel("bookmarks-" + userId);
    bc.current.onmessage = (e) => {
      if (e.data.type === "INSERT") {
        setBookmarks((prev) => {
          if (prev.find((x) => x.id === e.data.bookmark.id)) return prev;
          return [e.data.bookmark, ...prev];
        });
      }
      if (e.data.type === "DELETE") {
        setBookmarks((prev) => prev.filter((b) => b.id !== e.data.id));
      }
    };
    return () => {
      bc.current?.close();
    };
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    setLoading(true);

    const supabase = createClient();
    const finalUrl = url.startsWith("http") ? url : `https://${url}`;

    const optimisticBookmark: Bookmark = {
      id: crypto.randomUUID(),
      title,
      url: finalUrl,
      created_at: new Date().toISOString(),
      user_id: userId,
    };
    setBookmarks((prev) => [optimisticBookmark, ...prev]);
    setTitle("");
    setUrl("");

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({ title, url: finalUrl, user_id: userId })
      .select()
      .single();

    if (error) {
      setBookmarks((prev) =>
        prev.filter((b) => b.id !== optimisticBookmark.id),
      );
    } else if (data) {
      setBookmarks((prev) =>
        prev.map((b) => (b.id === optimisticBookmark.id ? data : b)),
      );
      // Tell other tabs
      bc.current?.postMessage({ type: "INSERT", bookmark: data });
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    const supabase = createClient();
    await supabase.from("bookmarks").delete().eq("id", id);
    bc.current?.postMessage({ type: "DELETE", id });
  };

  return (
    <>
      <form
        onSubmit={handleAdd}
        className="bg-gray-900 p-4 rounded-xl mb-6 flex flex-col gap-3"
      >
        <h2 className="text-lg font-semibold">Add a Bookmark</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="URL (e.g. google.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Bookmark"}
        </button>
      </form>

      {bookmarks.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No bookmarks yet. Add one above!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-gray-900 p-4 rounded-xl flex items-center justify-between"
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="font-semibold text-white truncate">
                  {bookmark.title}
                </span>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm hover:underline truncate"
                >
                  {bookmark.url}
                </a>
              </div>
              <button
                onClick={() => handleDelete(bookmark.id)}
                className="ml-4 text-gray-500 hover:text-red-500 transition text-xl font-bold"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
