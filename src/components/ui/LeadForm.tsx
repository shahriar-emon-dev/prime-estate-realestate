'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from '@/lib/hooks/useToast';

interface LeadFormProps {
  propertyId?: string;
  propertyTitle?: string;
  userId?: string | null;
  onSuccess?: () => void;
}

export default function LeadForm({
  propertyId,
  propertyTitle,
  userId,
  onSuccess,
}: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: propertyId
      ? `I'm interested in this property and would like to learn more.`
      : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: propertyId,
          userId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          leadType: propertyId ? 'inquiry' : 'general',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit inquiry');
        return;
      }

      toast.success('Your inquiry has been submitted!');
      setIsSuccess(true);
      onSuccess?.();
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Inquiry Submitted!
        </h3>
        <p className="text-green-700 text-sm">
          We&apos;ve received your message and will get back to you soon.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => {
            setIsSuccess(false);
            setFormData({
              name: '',
              email: '',
              phone: '',
              message: propertyId
                ? `I'm interested in this property and would like to learn more.`
                : '',
            });
          }}
        >
          Send another inquiry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {propertyId ? 'Interested in this property?' : 'Contact Us'}
      </h3>
      <p className="text-gray-600 text-sm mb-6">
        {propertyId
          ? 'Fill out the form and we\'ll get back to you shortly.'
          : 'Have a question? Send us a message.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          required
        />

        <Input
          label="Phone (Optional)"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+880 1XXX-XXXXXX"
        />

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us what you're looking for..."
            required
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Inquiry'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By submitting, you agree to our privacy policy.
        </p>
      </form>
    </div>
  );
}
