import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookmarkList from "../components/BookmarkList";
import AddBookmark from "../components/AddBookmark";
import LogoutButton from "../components/LogoutButton";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">📌 My Bookmarks</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome, {user.email}</p>
          </div>
          <LogoutButton />
        </div>
        <AddBookmark />
        <BookmarkList initialBookmarks={bookmarks || []} userId={user.id} />
      </div>
    </main>
  );
}
