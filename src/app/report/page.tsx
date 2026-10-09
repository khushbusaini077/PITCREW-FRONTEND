import type { Metadata } from "next";
import { ReportForm } from "@/components/report/ReportForm";

export const metadata: Metadata = { title: "Report a road issue · PITCREW" };

export default function ReportPage() {
  return (
    <div className="mx-auto my-5 w-[calc(100%-1.25rem)] max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:my-8 sm:w-[calc(100%-3rem)] sm:p-8">
      <h1 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">Report a road issue</h1>
      <p className="mb-6 mt-2 text-center text-sm leading-6 text-slate-600 sm:text-base">Tell us about a pothole. We rank it against every other open report and route a crew.</p>
      <ReportForm />
    </div>
  );
}
