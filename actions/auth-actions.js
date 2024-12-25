'use server';

import { redirect } from 'next/navigation';

import { hashUserPassword } from '@/lib/hash';
import { createUser } from '@/lib/user';
import { createAuthSession, createSessionCookie } from '@/lib/auth';

export async function signup(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  let errors = {};

  if (!email.includes('@')) {
    errors.email = 'Please enter a valid email address.';
  }

  if (password.trim().length < 8) {
    errors.password = 'Password should havet at least 8 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
    };
  }

  // create user
  const hashedPassword = hashUserPassword(password);

  try {
    const userId = createUser(email, hashedPassword);
    await createAuthSession(userId);
    redirect('/training');
  } catch (error) {
    // check if user already exists
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return {
        errors: {
          email: 'Email already exists. Please login instead.',
        },
      };
    }

    throw error;
  }
}
