export default function PrivacyPage() {
  return (
    <div className="px-4 pt-6 pb-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-[#8b8ba0] text-sm mt-1">
          Last updated: July 2026
        </p>
      </header>

      <div className="space-y-6 text-sm text-[#8b8ba0] leading-relaxed">
        <section>
          <h2 className="text-[#f0f0f5] font-semibold mb-2">
            Data Storage
          </h2>
          <p>
            All your data — trades, scores, and settings — is
            stored locally in your browser&apos;s localStorage.
            Nothing is sent to any server.
          </p>
        </section>

        <section>
          <h2 className="text-[#f0f0f5] font-semibold mb-2">
            Analytics
          </h2>
          <p>
            We use Vercel Analytics to collect anonymous,
            aggregated usage data (page views, performance
            metrics). This data cannot be used to identify
            you personally. No trading data, scores, or
            personal information is included.
          </p>
        </section>

        <section>
          <h2 className="text-[#f0f0f5] font-semibold mb-2">
            No Accounts
          </h2>
          <p>
            TiltCheck has no user accounts, login systems,
            or authentication. There is no personal
            information stored on any server.
          </p>
        </section>

        <section>
          <h2 className="text-[#f0f0f5] font-semibold mb-2">
            Chrome Extension
          </h2>
          <p>
            The TiltCheck Chrome extension does not
            communicate with any external server. It
            injects a button on trading sites and redirects
            you to tiltcheck.vercel.app when clicked. No
            data is collected or transmitted.
          </p>
        </section>

        <section>
          <h2 className="text-[#f0f0f5] font-semibold mb-2">
            Your Data
          </h2>
          <p>
            You can delete all your data at any time by
            clearing your browser&apos;s localStorage for this
            site, or by using the browser&apos;s clear browsing
            data feature.
          </p>
        </section>

        <section>
          <h2 className="text-[#f0f0f5] font-semibold mb-2">
            Contact
          </h2>
          <p>
            For questions about this privacy policy, reach
            out via the project&apos;s GitHub repository.
          </p>
        </section>
      </div>
    </div>
  );
}
