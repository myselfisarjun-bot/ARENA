import { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Login | ARENA",
  description: "Login to your ARENA account.",
}

export default function LoginPage() {
  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 flex-1">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r border-zinc-800">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white">ARENA<span className="text-red-500">.</span></Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <h1 className="text-[80px] font-black leading-[0.85] tracking-tighter mb-4 opacity-90 uppercase text-white">
              THE<br/>STRIKE
            </h1>
            <p className="text-lg text-zinc-400">
              Welcome back to the NIT Andhra Pradesh E-Sports Platform. Jump back into the action.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password below to login
            </p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link href="/auth/register" className="hover:text-brand underline underline-offset-4">
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
