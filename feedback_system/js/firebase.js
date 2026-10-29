// All Firebase code lives in this file (Authentication + Firestore).
// app.js calls these functions and never talks to Firebase directly.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, updateDoc, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const fs = getFirestore(app);

let registering = false; // pauses the auth listener while a new account is being created

// Firebase Auth needs an email, so each username maps to a private login email.
function toEmail(username) {
  return username.toLowerCase() + "@elroyale-feedback.app";
}

// ----- Authentication -----
export function login(username, password) {
  return signInWithEmailAndPassword(auth, toEmail(username), password);
}

export function logout() {
  return signOut(auth);
}

// Registers a student, saves the profile in the "users" collection, then signs out
// so the student logs in on the Login page.
export async function registerStudent(username, password, profile) {
  registering = true;
  try {
    const cred = await createUserWithEmailAndPassword(auth, toEmail(username), password);
    await setDoc(doc(fs, "users", cred.user.uid), { role: "student", ...profile, username: username.toLowerCase() });
    await signOut(auth);
  } finally {
    registering = false;
  }
}

// Calls callback(profile) when someone logs in and callback(null) when logged out.
export function watchAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (registering) return;
    if (!user) { callback(null); return; }
    try {
      const snap = await getDoc(doc(fs, "users", user.uid));
      if (!snap.exists()) { await signOut(auth); return; }
      callback({ id: user.uid, ...snap.data() });
    } catch (err) {
      await signOut(auth);
    }
  });
}

// ----- Feedback (Firestore collection "feedback") -----
export function submitFeedback(data) {
  return addDoc(collection(fs, "feedback"), data);
}

export function setStatus(id, status) {
  return updateDoc(doc(fs, "feedback", id), { status });
}

// Live updates: admins get all feedback, students get only their own.
// Returns a function that stops listening.
export function listenFeedback(me, callback, onError) {
  const col = collection(fs, "feedback");
  const q = me.role === "admin" ? col : query(col, where("uid", "==", me.id));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}
