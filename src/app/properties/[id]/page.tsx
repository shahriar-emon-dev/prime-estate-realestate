'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PropertyImageGallery from '@/components/ui/PropertyImageGallery';
import PropertyDetailsSection from '@/components/ui/PropertyDetailsSection';
import SimilarProperties from '@/components/ui/SimilarProperties';
import { getPropertyById } from '@/lib/dataService';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PropertyDetailPage({ params }: PageProps) {
  const [id, setId] = useState<string>('');
  const [property, setProperty] = useState<{
    id: string;
    title: string;
    price: string;
    city: string;
    area: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    description: string;
    features: string[];
    images: string[];
    agent?: { name: string; phone: string; email: string };
    agentName?: string;
    agentPhone?: string;
    agentEmail?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Unwrap params
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
      loadProperty(resolvedParams.id);
    });
  }, [params]);

  async function loadProperty(propertyId: string) {
    setLoading(true);
    setError(false);

    const { data, error: fetchError } = await getPropertyById(propertyId);

    if (fetchError || !data) {
      setError(true);
    } else {
      setProperty(data);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="text-lg text-gray-600 font-medium">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Property Not Found</h1>
          <p className="text-lg text-gray-600">
            The property you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/properties"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">



      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors font-medium">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/properties" className="hover:text-blue-600 transition-colors font-medium">Properties</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold truncate">{property.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column - Image Gallery (Spans 3 columns on large screens) */}
          <div className="lg:col-span-3">
            <PropertyImageGallery
              images={property.images}
              propertyTitle={property.title}
            />
          </div>

          {/* Right Column - Details (Spans 2 columns) */}
          <div className="lg:col-span-2">
            <PropertyDetailsSection
              title={property.title}
              price={property.price}
              city={property.city}
              area={property.area}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              squareFeet={property.squareFeet}
              description={property.description}
              features={property.features}
              agentName={property.agent?.name || property.agentName}
              agentPhone={property.agent?.phone || property.agentPhone}
              agentEmail={property.agent?.email || property.agentEmail}
            />
          </div>
        </div>

        {/* Similar Properties Section */}
        <div className="mt-24 pt-16 border-t-2 border-gray-100">
          <SimilarProperties currentPropertyId={id} />
        </div>
      </div>
    </main>
  );
}
