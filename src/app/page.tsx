import Link from "next/link";

const workflow = [
  { title: "Report", detail: "Citizens submit a road issue with a photo and location.", icon: "01" },
  { title: "Analyze", detail: "Reports are combined and scored by severity and exposure.", icon: "02" },
  { title: "Prioritize", detail: "The system ranks repairs so urgent issues rise to the top.", icon: "03" },
  { title: "Repair", detail: "Crews receive an ordered route and update repair status.", icon: "04" },
];

const benefits = [
  { title: "One clear repair queue", detail: "Bring road reports into a single, prioritized view." },
  { title: "Smarter crew routes", detail: "Plan repair stops around priority and crew availability." },
  { title: "Transparent decisions", detail: "Compare scheduling approaches and understand why issues rank." },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <section className="rw-hero rounded-2xl px-5 py-10 text-white shadow-xl sm:rounded-3xl sm:px-10 sm:py-14 lg:px-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_.75fr] lg:gap-14">
          <div className="max-w-3xl">
            <span className="rw-eyebrow"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-teal-300" /> Smarter roads. Faster response.</span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Make every road report <span className="text-teal-200">count.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">PITCREW helps municipal teams turn pothole reports into clear priorities, practical repair routes, and more accountable road maintenance.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/report" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-slate-900 shadow-lg hover:bg-teal-50 sm:text-base">Report a road issue <span aria-hidden="true" className="ml-2">↗</span></Link>
              <Link href="/dashboard" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white hover:bg-white/15 sm:text-base">Explore operations dashboard <span aria-hidden="true" className="ml-2">→</span></Link>
            </div>
            <p className="mt-5 text-xs text-slate-300 sm:text-sm">Designed for clearer decisions from report to repair.</p>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-sm sm:p-5">
              <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-4">
                <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-teal-100">Road operations</p><h2 className="mt-1 text-lg font-bold sm:text-xl">From report to action</h2></div>
                <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-100">Workflow</span>
              </div>
              <div className="mt-4 space-y-3">
                {workflow.map((step, index) => (
                  <div key={step.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/15 p-3 sm:p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-200 text-sm font-extrabold text-slate-900">{step.icon}</span>
                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{step.title}</h3>{index < workflow.length - 1 && <span className="text-xs text-teal-100">Next step ↓</span>}</div><p className="mt-1 text-sm leading-6 text-slate-200">{step.detail}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16" aria-labelledby="benefits-title">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-teal-800">Built for better maintenance</p>
          <h2 id="benefits-title" className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">A clearer way to manage road issues</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Bring reports, prioritization, and crew planning together in one workflow.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <article key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6">
              <span className="rw-step-number">0{index + 1}</span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-3 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="max-w-2xl"><h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Ready to get started?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Submit a road issue or open the dashboard to review repair priorities and crew plans.</p></div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-48"><Link href="/report" className="btn-grad inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-bold">Create a report</Link><Link href="/dashboard" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Open dashboard</Link></div>
      </section>
    </div>
  );
}
