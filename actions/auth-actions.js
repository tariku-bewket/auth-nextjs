'use server';

import { redirect } from 'next/navigation';

import { hashUserPassword, verifyPassword } from '@/lib/hash';
import { createUser, getUserByEmail } from '@/lib/user';
import { createAuthSession, destroyAuth } from '@/lib/auth';

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

export async function login(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const extistingUser = getUserByEmail(email);

  if (!extistingUser) {
    return {
      errors: {
        email: 'Could not authenticate user, please check your credentials.',
      },
    };
  }

  const isValidPassword = verifyPassword(extistingUser.password, password);

  if (!isValidPassword) {
    return {
      errors: {
        password: 'Could not authenticate user, please check your credentials.',
      },
    };
  }

  await createAuthSession(extistingUser.id);
  redirect('/training');
}

export async function auth(mode, prevState, formData) {
  if (mode === 'login') {
    return await login(prevState, formData);
  }

  return await signup(prevState, formData);
}

export async function logout() {
  await destroyAuth();
  redirect('/');
}
