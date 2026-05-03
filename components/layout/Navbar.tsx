"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';

export function Navbar() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'profiles', user.uid)).then(docSnap => {
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      });
    }
  }, [user]);

  return (
    <nav className="border-b border-zinc-800 px-8 py-4 flex items-center justify-between bg-zinc-950">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">ARENA<span className="text-red-500">.</span></Link>
        <div className="flex gap-6 text-sm font-medium text-zinc-400">
          <Link href="/tournaments" className="hover:text-white">Tournaments</Link>
          <Link href="/teams" className="hover:text-white">Teams</Link>
          {user && (
            <>
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
             <div className="text-right mr-2 hidden sm:block">
               {profile?.role === 'admin' && <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Admin</p>}
               <p className="text-sm font-semibold">{profile?.full_name || user.email}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-red-500 uppercase">
                {profile?.full_name ? profile.full_name.substring(0, 2) : 'US'}
             </div>
             <Button variant="outline" size="sm" className="border-zinc-700" onClick={() => signOut(auth)}>Logout</Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
             <Link href="/auth/login"><Button variant="ghost" size="sm">Login</Button></Link>
             <Link href="/auth/register"><Button size="sm" className="bg-white text-black font-bold uppercase hover:bg-zinc-200">Register</Button></Link>
          </div>
        )}
      </div>
    </nav>
  );
}
