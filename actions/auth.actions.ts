'use server'; 

import prisma from '../lib/prisma'; 
import bcrypt from 'bcryptjs';
import { createSession } from '../lib/session'; // NEW: Import the session engine

// --- REGISTER ACTION ---
export async function registerUser(name: string, email: string, password: string) {
  try {
    if (!name || !email || !password) return { error: 'Please provide all fields' };

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return { error: 'User already exists' };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // NEW: Lock the session into the browser cookie!
    await createSession(user.id, user.name); 

    return {
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    };
  } catch (error) {
    console.error('Registration Error:', error);
    return { error: 'Something went wrong during registration' };
  }
}

// --- LOGIN ACTION ---
export async function loginUser(email: string, password: string) {
  try {
    if (!email || !password) return { error: 'Please provide email and password' };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: 'Invalid credentials' };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { error: 'Invalid credentials' };

    // NEW: Lock the session into the browser cookie!
    await createSession(user.id, user.name);

    return {
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    };
  } catch (error) {
    console.error('Login Error:', error);
    return { error: 'Something went wrong during login' };
  }
}