export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Prime Estate (&quot;the Platform&quot;), you agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use of Services</h2>
            <p>
              Prime Estate provides a platform for property listings and real estate services. 
              You agree to use the platform only for lawful purposes and in accordance with these terms.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>You must be at least 18 years old to use this platform</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree to provide accurate and complete information</li>
              <li>You may not use the platform for fraudulent activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Property Listings</h2>
            <p>
              Property listings on Prime Estate are provided by third-party sellers and agents. 
              We do not guarantee the accuracy, completeness, or reliability of any listing information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Content</h2>
            <p>
              By submitting content to Prime Estate, you grant us a non-exclusive, royalty-free 
              license to use, display, and distribute your content on our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Limitation of Liability</h2>
            <p>
              Prime Estate is not liable for any direct, indirect, incidental, or consequential 
              damages arising from your use of the platform or any property transactions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the platform 
              after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@primeestate.com" className="text-blue-600 hover:underline">
                legal@primeestate.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
