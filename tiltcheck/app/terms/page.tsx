export default function TermsPage() {
  return (
    <div className="px-4 pt-6 pb-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">
          Terms of Use
        </h1>
        <p className="text-[#8b8ba0] text-sm mt-1">
          Last updated: July 2026
        </p>
      </header>

      <div className="space-y-6 text-sm text-[#8b8ba0] leading-relaxed">
        <section>
          <h2 className="text-[#f0f0f5] font-semibold mb-2">
            Disclaimer
          </h2>
          <p>
            TiltCheck is a discipline tool, not financial
            advice. It does not guarantee trading profits or
            prevent losses. Trading involves risk, and you
            are solely responsible for your trading
            decisions.
          </p>
        </section>

        <section>
          <h2 className="text-[#f0f0f5] font-semibold mb-2">
            Not Financial Advice
          </h2>
          <p>
            Nothing in TiltCheck constitutes financial
            advice, investment recommendations, or trading
            signals. The readiness score is a behavioral
            self-assessment tool, not a market indicator.
          </p>
        </section>

        <section>
          <h2 className="text-[#f0f0f5] font-semibold mb-2">
            No Warranty
          </h2>
          <p>
            TiltCheck is provided as-is without warranties.
            We do not guarantee that the app will be
            error-free, uninterrupted, or available at all
            times.
          </p>
        </section>

        <section>
          <h2 className="text-[#f0f0f5] font-semibold mb-2">
            Limitation of Liability
          </h2>
          <p>
            TiltCheck and its creators are not liable for
            any trading losses, financial damages, or other
            consequences resulting from the use or inability
            to use this application.
          </p>
        </section>

        <section>
          <h2 className="text-[#f0f0f5] font-semibold mb-2">
            Changes
          </h2>
          <p>
            We may update these terms from time to time.
            Continued use of TiltCheck after changes
            constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
