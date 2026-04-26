import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Spinner } from "../../components/spinner";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-ink text-warm">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(184,146,63,0.06)_0%,transparent_38%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-[minmax(0,1fr)_min(100%,440px)]">
        <div className="hidden flex-col justify-end border-r border-warm/[0.06] bg-ink-2/80 px-12 py-14 lg:flex">
          <div className="mb-9 overflow-hidden rounded-sm border border-warm/[0.08] bg-ink-3/50 shadow-lift">
            <Image
              src="/login-hero.svg"
              alt="Financial insight illustration"
              width={1200}
              height={560}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
          <p className="font-display text-4xl font-light leading-[1.12] tracking-tight text-warm lg:text-[2.75rem]">
            Numbers you can stand behind.
          </p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-warm-muted">
            Invoicing, collections, and signals in one deliberate workspace — built for clarity, not noise.
          </p>
          <p className="mt-10 font-display text-sm text-brass-muted">Smart Billing</p>
        </div>
        <div className="flex flex-col justify-center px-5 py-14 sm:px-10">
          <Suspense
            fallback={
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
