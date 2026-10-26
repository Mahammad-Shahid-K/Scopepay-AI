import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Receipt,
  CreditCard,
  ArrowRight,
  GitCompare,
  FileCheck2,
  Clock,
  DollarSign,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* Navigation */}
      <nav className="border-b border-[#E5E7EB] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#DC2626] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#111827]">
              ScopePay <span className="text-[#DC2626]">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm">Launch App</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-xs font-semibold text-[#DC2626] mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PayPal AI Hackathon Project • Built for Freelancers & Agencies</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.15] mb-6">
          Agree on the work. <br className="hidden sm:inline" />
          <span className="text-[#DC2626]">Get paid.</span> Avoid scope creep.
        </h1>

        <p className="text-lg sm:text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed mb-10">
          ScopePay AI converts customer requests into structured proposals, detects unauthorized scope additions, and connects approved agreements directly to verified PayPal payments.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto" icon={<ArrowRight className="w-4 h-4" />}>
              Get Started with Dashboard
            </Button>
          </Link>
          <Link to="/pay/tok_artisan_deposit_9921" target="_blank" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Test Customer PayPal Checkout
            </Button>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border border-[#E5E7EB] bg-[#F9FAFB] rounded-xl p-5 text-left">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#111827]">Structured Scopes</p>
              <p className="text-[11px] text-[#6B7280]">AI deliverables & exclusions</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#111827]">Scope Creep Guard</p>
              <p className="text-[11px] text-[#6B7280]">Compare new requests</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#111827]">PayPal Sandbox</p>
              <p className="text-[11px] text-[#6B7280]">Backend verified payments</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#111827]">Invoicing & Quotes</p>
              <p className="text-[11px] text-[#6B7280]">Automated milestone links</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow Demonstration */}
      <section className="py-16 bg-[#F9FAFB] border-y border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">
              The Complete Project-to-Payment Workflow
            </h2>
            <p className="text-sm text-[#6B7280] mt-2 max-w-xl mx-auto">
              How ScopePay AI protects freelancers from unbilled hours while giving clients a friction-free checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 relative shadow-xs">
              <div className="w-9 h-9 rounded-md bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center font-bold text-sm mb-4 border border-red-200">
                1
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-1.5">AI Scope Generator</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Paste raw client emails. Gemini AI generates deliverables, exclusions, assumptions, timeline, and questions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 relative shadow-xs">
              <div className="w-9 h-9 rounded-md bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center font-bold text-sm mb-4 border border-red-200">
                2
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-1.5">Quotation & Approval</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Review the scope, adjust pricing, and approve the formal agreement. Version 1 is permanently locked for comparison.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 relative shadow-xs">
              <div className="w-9 h-9 rounded-md bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center font-bold text-sm mb-4 border border-red-200">
                3
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-1.5">PayPal Sandbox Pay</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Client receives a secure link, reviews invoice deliverables, and pays via PayPal. Server captures and verifies the payment.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 relative shadow-xs border-red-300 ring-1 ring-red-200">
              <div className="w-9 h-9 rounded-md bg-[#DC2626] text-white flex items-center justify-center font-bold text-sm mb-4">
                4
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-1.5 flex items-center gap-1.5">
                <span>Scope Creep Shield</span>
                <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                When the client sends a mid-project addition, AI highlights what falls outside the agreed scope and drafts a revised quote.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white border border-[#E5E7EB] rounded-lg">
            <div className="w-10 h-10 rounded-md bg-[#FEF2F2] flex items-center justify-center text-[#DC2626] mb-4 border border-red-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-2">Gemini AI Scope Analysis</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Never forget to exclude native apps, extra revision rounds, or complex hosting setup. The AI automatically enumerates essential boundaries.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E7EB] rounded-lg">
            <div className="w-10 h-10 rounded-md bg-[#FEF2F2] flex items-center justify-center text-[#DC2626] mb-4 border border-red-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-2">Verified PayPal Sandbox</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Orders are created on the server and captured via PayPal Orders REST API. Status is never marked as paid until the server recalculates and verifies the capture.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E7EB] rounded-lg">
            <div className="w-10 h-10 rounded-md bg-[#FEF2F2] flex items-center justify-center text-[#DC2626] mb-4 border border-red-200">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-2">Scope Change Comparison</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Side-by-side comparison of the original contract vs new messages. Generates courteous client replies and estimates required timeline extensions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-16 bg-[#FEF2F2] border-t border-red-200 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-3">
            Ready to stop working for free?
          </h2>
          <p className="text-sm text-[#6B7280] mb-8">
            Create your first project scope, approve the deliverables, and test sandbox checkout in minutes.
          </p>
          <Link to="/dashboard">
            <Button size="lg" icon={<ChevronRight className="w-4 h-4" />}>
              Open ScopePay AI Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] py-8 bg-white text-center text-xs text-[#6B7280]">
        <p>© 2026 ScopePay AI. Designed for the PayPal AI Hackathon. Agree on the work. Get paid. Avoid scope creep.</p>
      </footer>
    </div>
  );
};
