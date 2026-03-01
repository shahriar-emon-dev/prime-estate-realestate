// src/app/agent/page.tsx
// Redirect to dashboard
import { redirect } from 'next/navigation';

export default function AgentIndexPage() {
  redirect('/agent/dashboard');
}
