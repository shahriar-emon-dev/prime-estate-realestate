'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            About Estate Connect
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Your trusted partner in finding the perfect property in Bangladesh
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            At Estate Connect, we&apos;re dedicated to revolutionizing the real estate experience in Bangladesh. 
            Our mission is to make property search and transactions seamless, transparent, and trustworthy 
            for everyone in the market.
          </p>
        </div>

        {/* Services Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Property Search</h3>
              <p className="text-gray-600">
                Find your dream home with our comprehensive property listings across Bangladesh&apos;s 
                most desirable locations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Market Analysis</h3>
              <p className="text-gray-600">
                Get detailed market insights and property valuations to make informed decisions.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Expert Support</h3>
              <p className="text-gray-600">
                Receive guidance from our experienced real estate professionals throughout your journey.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Estate Connect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Local Expertise</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Deep understanding of Bangladesh&apos;s real estate market</li>
                <li>• Extensive network of verified properties</li>
                <li>• Knowledge of local property laws and regulations</li>
                <li>• Familiarity with all major neighborhoods</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Our Commitment</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Transparent property listings</li>
                <li>• Verified property information</li>
                <li>• Secure transaction process</li>
                <li>• Dedicated customer support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 mb-4">
                Ready to find your perfect property? Contact us today and let us help you 
                navigate the Bangladesh real estate market with confidence.
              </p>
              <div className="space-y-2 text-gray-600">
                <p>📍 Gulshan-2, Dhaka, Bangladesh</p>
                <p>📞 +880 1234-567890</p>
                <p>✉️ info@estateconnect.bd</p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Office Hours</h3>
              <div className="space-y-2 text-gray-600">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 