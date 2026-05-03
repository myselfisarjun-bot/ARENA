import { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = {
  title: "Register | ARENA",
  description: "Create an account.",
}

export default function RegisterPage() {
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
              JOIN<br/>THE<br/>FIGHT
            </h1>
            <p className="text-lg text-zinc-400">
              Only for NIT Andhra Pradesh students. Register, form your team, and compete for glory.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your details below to create your account
            </p>
          </div>
          <RegisterForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-brand underline underline-offset-4">
              Already have an account? Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
