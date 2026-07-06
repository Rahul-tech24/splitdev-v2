'use server'; 
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

export async function registerUser(name: string, email: string, password: string) {
  try {
    // 1. Validation
    if (!name || !email || !password) {
      return { error: 'Please provide all fields' };
    }

    // 2. The O(1) Check (Preventing CPU overload)
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return { error: 'User already exists' };
    }

    // 3. Cryptography
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. The Database Mutation
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 5. The Response
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    };
  } catch (error) {
    console.error('Registration Error:', error);
    return { error: 'Something went wrong during registration' };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    if (!email || !password) {
      return { error: 'Please provide email and password' };
    }

    // 1. Find the user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Invalid credentials' }; // We don't say "Email not found" for security
    }

    // 2. Verify the cryptography
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { error: 'Invalid credentials' };
    }

    // 3. Success! Return the user data (NEVER return the password)
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    };
  } catch (error) {
    console.error('Login Error:', error);
    return { error: 'Something went wrong during login' };
  }
}