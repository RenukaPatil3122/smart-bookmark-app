"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Bookmark = { id: string; title: string; url: string; created_at: string; user_id: string; };

export default function BookmarkList({ initialBookmarks, userId }: { initialBookmarks: Bookmark[]; userId: string; }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("bookmarks-" + userId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookmarks" }, (payload) => {
        const b = payload.new as Bookmark;
        if (b.user_id === userId) setBookmarks((prev) => [b, ...prev]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "bookmarks" }, (payload) => {
        setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
      })
      .subscribe((status) => console.log("Realtime:", status));
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  if (bookmarks.length === 0) return <div className="text-center text-gray-500 mt-10">No bookmarks yet. Add one above!</div>;

  return (
    <div className="flex flex-col gap-3">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="bg-gray-900 p-4 rounded-xl flex items-center justify-between">
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="font-semibold text-white truncate">{bookmark.title}</span>
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline truncate">{bookmark.url}</a>
          </div>
          <button onClick={() => handleDelete(bookmark.id)} className="ml-4 text-gray-500 hover:text-red-500 transition text-xl font-bold">&times;</button>
        </div>
      ))}
    </div>
  );
}
