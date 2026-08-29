import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import type { JournalEntry } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use specified databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    throw err;
  }
};

export const signInGuest = async () => {
  try {
    return await signInAnonymously(auth);
  } catch (err: any) {
    console.error('Anonymous Sign-In Error:', err);
    throw err;
  }
};

export const signUpEmail = async (email: string, pass: string) => {
  return await createUserWithEmailAndPassword(auth, email, pass);
};

export const signInEmail = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const logOut = async () => {
  return await fbSignOut(auth);
};

/**
 * Enterprise Database Isolation Helper
 * Path: /users/{userId}/journals/{journalId}
 * Guarantees zero cross-user query exposure per Constitution rule #3
 */
export const getUserJournalsRef = (userId: string) => {
  if (!userId) throw new Error('Security Error: userId required for collection scoping.');
  return collection(db, 'users', userId, 'journals');
};

export const getUserJournalDocRef = (userId: string, journalId: string) => {
  if (!userId || !journalId) throw new Error('Security Error: userId & journalId required.');
  return doc(db, 'users', userId, 'journals', journalId);
};

export const saveJournalToFirestore = async (userId: string, entry: JournalEntry) => {
  if (!userId) throw new Error('Cannot persist unauthenticated journal entry.');
  const docRef = getUserJournalDocRef(userId, entry.id);
  const dataToSave = {
    ...entry,
    updatedAt: Date.now(),
    serverTimestamp: serverTimestamp(),
  };
  await setDoc(docRef, dataToSave, { merge: true });
};

export const deleteJournalFromFirestore = async (userId: string, journalId: string) => {
  if (!userId || !journalId) return;
  const docRef = getUserJournalDocRef(userId, journalId);
  await deleteDoc(docRef);
};

export { onAuthStateChanged, type User };
