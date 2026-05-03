"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const setupSchema = z.object({
  valorant: z.string().optional(),
  chess: z.string().optional(),
});

type FormData = z.infer<typeof setupSchema>;

export default function SetupProfilePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [user, loading] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(setupSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!loading && !user) {
        router.push("/auth/login");
        return;
      }
      if (user) {
        const docSnap = await getDoc(doc(db, "profiles", user.uid));
        if (docSnap.exists() && Object.keys(docSnap.data().game_tags || {}).length > 0) {
          router.push('/dashboard');
        } else {
          setIsLoading(false);
        }
      }
    };
    fetchUser();
  }, [user, loading, router]);

  async function onSubmit(data: FormData) {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    
    const gameTags = {
        ...(data.valorant ? { valorant: data.valorant } : {}),
        ...(data.chess ? { chess: data.chess } : {})
    };

    try {
      await updateDoc(doc(db, "profiles", user.uid), { game_tags: gameTags });
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  if (loading || isLoading) return <div className="p-8 flex justify-center">Loading...</div>;

  return (
    <div className="container max-w-lg mx-auto py-24">
      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Complete Profile Setup</CardTitle>
          <CardDescription className="text-zinc-400">
            Add your game tags to participate in tournaments. These are optional, but required if you want to join a team for that specific game.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="valorant">Valorant Riot ID</Label>
              <Input
                id="valorant"
                placeholder="PlayerName#1234"
                className="bg-zinc-950 border-zinc-800"
                {...register("valorant")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chess">Chess.com Username</Label>
              <Input
                id="chess"
                placeholder="username"
                className="bg-zinc-950 border-zinc-800"
                {...register("chess")}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full bg-white text-black font-bold uppercase hover:bg-zinc-200">
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
