"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AddBookmark() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("bookmarks").insert({
      title,
      url: url.startsWith("http") ? url : `https://${url}`,
      user_id: user?.id,
    });

    setTitle("");
    setUrl("");
    setLoading(false);
  };

  return (
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
  );
}
