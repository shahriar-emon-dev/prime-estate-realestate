/**
 * Form Validation Schemas using Zod
 * Type-safe validation for all forms in the application
 */

import { z } from 'zod';

// Property Form Validation
export const propertySchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  
  price: z.number()
    .positive('Price must be a positive number')
    .min(100000, 'Price must be at least ৳1 Lakh'),
  
  city: z.string()
    .min(2, 'Please select a city'),
  
  area: z.string()
    .min(2, 'Please select an area'),
  
  bedrooms: z.number()
    .int()
    .min(1, 'Must have at least 1 bedroom')
    .max(20, 'Maximum 20 bedrooms'),
  
  bathrooms: z.number()
    .int()
    .min(1, 'Must have at least 1 bathroom')
    .max(20, 'Maximum 20 bathrooms'),
  
  square_feet: z.number()
    .int()
    .positive()
    .min(100, 'Minimum 100 sq ft')
    .max(100000, 'Maximum 100,000 sq ft'),
  
  property_type: z.string()
    .min(2, 'Please select a property type'),
  
  status: z.enum(['Available', 'Pending', 'Sold', 'Rented']),
  
  features: z.array(z.string()).optional(),
  
  furnishing: z.enum(['Furnished', 'Semi-Furnished', 'Unfurnished']).optional(),
  
  parking_spaces: z.number().int().min(0).optional(),
  
  floor_number: z.number().int().min(0).optional(),
  
  total_floors: z.number().int().min(1).optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

// Contact Form Validation
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string()
    .email('Please enter a valid email address'),
  
  phone: z.string()
    .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Please enter a valid Bangladesh phone number')
    .optional()
    .or(z.literal('')),
  
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  
  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Login Form Validation
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration Form Validation
export const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string()
    .email('Please enter a valid email address'),
  
  phone: z.string()
    .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Please enter a valid Bangladesh phone number'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string(),
}).refine((data: any) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Meeting Request Validation
export const meetingRequestSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  
  client_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  client_email: z.string()
    .email('Please enter a valid email address'),
  
  client_phone: z.string()
    .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Please enter a valid Bangladesh phone number'),
  
  preferred_date: z.string()
    .refine((date: any) => new Date(date) >= new Date(), {
      message: 'Date must be in the future',
    }),
  
  preferred_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
  
  message: z.string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
});

export type MeetingRequestFormData = z.infer<typeof meetingRequestSchema>;

// Site Visit Request Validation
export const siteVisitSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  
  client_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  client_email: z.string()
    .email('Please enter a valid email address'),
  
  client_phone: z.string()
    .regex(/^(\+880|0)?1[3-9]\d{8}$/, 'Please enter a valid Bangladesh phone number'),
  
  visit_date: z.string()
    .refine((date: any) => new Date(date) >= new Date(), {
      message: 'Date must be in the future',
    }),
  
  visit_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
});

export type SiteVisitFormData = z.infer<typeof siteVisitSchema>;
