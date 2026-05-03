"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth, db } from "@/lib/firebase/client"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { Alert, AlertDescription } from "@/components/ui/alert"

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().endsWith("@student.nitandhra.ac.in", "Must be a valid @student.nitandhra.ac.in email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormData = z.infer<typeof registerSchema>

export function RegisterForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setError(null)
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      // Create profile document
      await setDoc(doc(db, "profiles", user.uid), {
        full_name: data.fullName,
        college_email: data.email,
        role: 'student',
        game_tags: {},
        created_at: new Date().toISOString()
      })

      router.push("/profile/setup")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              type="text"
              disabled={isLoading}
              {...register("fullName")}
            />
            {errors?.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">College Email</Label>
            <Input
              id="email"
              placeholder="name@student.nitandhra.ac.in"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors?.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button disabled={isLoading} className="bg-white text-black font-bold py-3 text-xs uppercase hover:bg-zinc-200">
            {isLoading && (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]" />
            )}
            Create Account
          </Button>
        </div>
      </form>
    </div>
  )
}
