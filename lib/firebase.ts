"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from "@/content/site";

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;

export function fb(): { auth: Auth; db: Firestore } | null {
  if (!firebaseReady) return null;
  app ??= getApps()[0] ?? initializeApp(firebaseConfig);
  return { auth: getAuth(app), db: getFirestore(app) };
}
