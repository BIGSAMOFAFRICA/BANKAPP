export default function About() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            About BIGSAMOFAFRICA BANK
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Built by an  final-year student to make banking simpler for Nigerians.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10 mb-8">
          <div className="space-y-6">
            <p className="text-lg text-slate-700 leading-relaxed">
              BIGSAMOFAFRICA BANK started with a clear goal: remove friction from everyday
              banking in Nigeria. From bill payments to person‑to‑person transfers, the focus
              is a clean, calm experience that just works.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              This is a student-built project—designed and engineered to prove
              that reliable, modern fintech can be crafted locally with care and attention to detail.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Our Mission</h3>
              <p className="text-slate-700">
                Help Nigerians send, receive, and manage money with confidence—without the noise.
                Secure by default. Simple by design.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Made in Nigeria</h2>
          <p className="text-lg text-slate-700 leading-relaxed text-center max-w-2xl mx-auto">
            From concept to code, this project reflects the creativity of young Nigerian
            builders. Thank you for banking with BIGSAMOFAFRICA.
          </p>
        </div>
      </div>
    </div>
  );
}
