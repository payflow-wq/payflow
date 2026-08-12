export type UserRole = "user" | "family_admin" | "admin";

/** Firestore document at users/{userId}. Firebase Auth remains the source of truth for credentials. */
export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  role: UserRole;
  currency: "NGN";
  country: "NG";
  timezone: string;
  createdAt: string;
  updatedAt: string;
  preferences: {
    emailNotifications: boolean;
    billReminders: boolean;
    pushNotifications: boolean;
  };
}
