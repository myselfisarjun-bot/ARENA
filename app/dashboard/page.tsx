"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "profiles", user.uid)).then((docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      });
    }
  }, [user]);

  if (loading || (!user && !profile)) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 flex-1">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
             <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">My Information</h2>
             <div className="space-y-2">
                <p><span className="text-zinc-500 text-sm">Name:</span> <span className="font-semibold">{profile?.full_name}</span></p>
                <p><span className="text-zinc-500 text-sm">Email:</span> <span className="font-semibold">{profile?.college_email}</span></p>
                <div className="pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Game Tags</h3>
                  {Object.keys(profile?.game_tags || {}).length === 0 ? (
                    <p className="text-sm text-zinc-500">No game tags set.</p>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(profile?.game_tags || {}).map(([game, tag]) => (
                        <p key={game} className="text-sm capitalize"><span className="text-zinc-500">{game}:</span> <span className="font-semibold">{tag as string}</span></p>
                      ))}
                    </div>
                  )}
                </div>
             </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
             <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">My Teams</h2>
             <p className="text-sm text-zinc-400">Team management coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
