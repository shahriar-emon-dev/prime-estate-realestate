'use client';

import { FaStar } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    name: 'Ahmed Rahman',
    role: 'Property Buyer',
    image: 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    comment: 'Prime Estate helped me find my dream home in Gulshan. Their team was professional, knowledgeable, and made the entire process smooth. Highly recommended!',
    rating: 5,
    location: 'Dhaka, Bangladesh'
  },
  {
    id: 2,
    name: 'Fatima Akter',
    role: 'Property Seller',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80',
    comment: 'I sold my property through Prime Estate and was amazed by their efficiency. They got me a great deal and handled all the paperwork professionally.',
    rating: 5,
    location: 'Chittagong, Bangladesh'
  },
  {
    id: 3,
    name: 'Mohammad Ali',
    role: 'Investor',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    comment: 'As a real estate investor, I appreciate Prime Estate\'s market insights and professional approach. They\'ve helped me make several profitable investments.',
    rating: 5,
    location: 'Sylhet, Bangladesh'
  }
];

const Testimonials = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Hear from our satisfied clients across Bangladesh
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <img
                    className="w-20 h-20 rounded-full object-cover"
                    src={testimonial.image}
                    alt={testimonial.name}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-full">
                    <FaStar className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-600 italic mb-4">
                  "{testimonial.comment}"
                </p>

                <h3 className="text-lg font-semibold text-gray-900">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Read More Reviews
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonials; 