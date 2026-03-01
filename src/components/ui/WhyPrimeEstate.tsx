'use client';

import { FaHandshake, FaHome, FaUserFriends, FaChartLine, FaInfoCircle, FaComments } from 'react-icons/fa';

const features = [
  {
    icon: <FaHandshake className="w-8 h-8" />,
    title: 'Local Area Expertise',
    description: 'We know your neighborhood like the back of our hand. Our deep understanding of local markets ensures you make informed decisions.',
  },
  {
    icon: <FaHome className="w-8 h-8" />,
    title: 'Full-Service Experience',
    description: 'From listings to legal, we handle it all for you. One-stop solution for all your real estate needs in Bangladesh.',
  },
  {
    icon: <FaUserFriends className="w-8 h-8" />,
    title: 'Client-First Approach',
    description: 'Your goals are our priority, always. We listen, understand, and work tirelessly to meet your specific requirements.',
  },
  {
    icon: <FaChartLine className="w-8 h-8" />,
    title: 'Proven Results',
    description: 'Track record of fast, smooth, and profitable deals. Our success stories speak for themselves.',
  },
  {
    icon: <FaInfoCircle className="w-8 h-8" />,
    title: 'Transparent Process',
    description: 'No jargon, no hidden fees—just honest guidance. We believe in complete transparency in all our dealings.',
  },
  {
    icon: <FaComments className="w-8 h-8" />,
    title: 'Happy Clients Speak',
    description: 'Real stories from people we\'ve helped, and who recommend us. Our satisfied clients are our best ambassadors.',
  },
];

const Whyprimeestate = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Why Prime Estate?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Your trusted partner in real estate across Bangladesh
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Get Started with Prime Estate
          </button>
        </div>
      </div>
    </div>
  );
};

export default Whyprimeestate; 