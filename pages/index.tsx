import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,#0F172A,transparent_60%)] opacity-[0.06]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
                Simplifying payments for Nigerians
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl">
                BIGSAMOFAFRICA BANK is a student-built innovation for seamless bill payments and instant transfers.
                Modern. Secure. Made for everyday life.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-amber-300 text-slate-900 font-semibold hover:bg-amber-400 transition-colors"
                >
                  Login
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
                <Stat label="Transfers/day" value="120k" />
                <Stat label="Active customers" value="20k+" />
                <Stat label="Uptime" value="99.99%" />
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Current Balance</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">₦245,500.00</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    Secure by design
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <FeaturePill title="Instant transfers" />
                  <FeaturePill title="Zero hidden fees" />
                  <FeaturePill title="Bill payments" />
                  <FeaturePill title="24/7 support" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Why BIGSAMOFAFRICA</h2>
            <p className="mt-3 text-slate-600">Clean, reliable, and built for Nigeria. No clutter—just banking that works.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <Card title="Protected" text="Multi‑layer security and real‑time monitoring keep your money safe." />
            <Card title="Lightning fast" text="Transfers land in seconds. No delays, no drama." />
            <Card title="Made for you" text="A calm interface that helps you do more with less effort." />
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl border border-slate-200 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Open an account in minutes</h3>
              <p className="mt-2 text-slate-600">Join thousands already banking the simple way.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/signup" className="px-5 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">Get started</Link>
              <Link href="/about" className="px-5 py-3 rounded-lg bg-amber-300 text-slate-900 font-semibold hover:bg-amber-400 transition-colors">Learn more</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-7xl mx-auto border-t border-slate-200 pt-8 text-sm text-slate-500">
          <p>© 2025 BIGSAMOFAFRICA BANK. Built by Olabisi Samuel.</p>
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function FeaturePill({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
      <span>{title}</span>
    </div>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
