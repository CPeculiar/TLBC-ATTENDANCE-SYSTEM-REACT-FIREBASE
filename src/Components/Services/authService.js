// src/services/authService.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';

const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
const logout = () => signOut(auth);

export { register, login, logout };
