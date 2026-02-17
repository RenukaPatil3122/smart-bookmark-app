import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "./components/LoginButton";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-10 rounded-2xl shadow-xl flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-white">📌 Smart Bookmarks</h1>
        <p className="text-gray-400">
          Save and manage your bookmarks privately
        </p>
        <LoginButton />
      </div>
    </main>
  );
}
