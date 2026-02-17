"use client";
import { createClient } from "@/lib/supabase/client";

export default function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-3 bg-white text-gray-800 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
    >
      <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
      Sign in with Google
    </button>
  );
}
