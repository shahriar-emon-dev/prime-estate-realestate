import Hero from '@/components/ui/Hero';
import FeaturedProperties from '@/components/ui/FeaturedProperties';
import Whyprimeestate from '@/components/ui/WhyPrimeEstate';
import RecentListings from '@/components/ui/RecentListings';
import RecentSales from '@/components/ui/RecentSales';
import Testimonials from '@/components/ui/Testimonials';

export default function HomePage() {
  return (
    <section>
      <Hero />
      <FeaturedProperties />
      <RecentListings />
      <RecentSales />
      <Whyprimeestate />
      <Testimonials />
    </section>
  );
}
