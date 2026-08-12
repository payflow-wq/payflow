"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { userService } from "@/services/user/UserService";

/**
 * Client-side auth operations. Keeps Firebase Auth calls out of UI
 * components — components call this service, not the Firebase SDK directly.
 */
class AuthService {
  async login(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    return credential.user;
  }

  async register(email: string, password: string, fullName: string, phoneNumber?: string): Promise<User> {
    const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await updateProfile(credential.user, { displayName: fullName });
    // Create the Firestore users/{uid} profile as part of registration (Step 3).
    await userService.createUserProfile(credential.user, { phoneNumber });
    return credential.user;
  }

  async logout(): Promise<void> {
    await signOut(getFirebaseAuth());
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  }
}

export const authService = new AuthService();
