'use client';
import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm.js';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
