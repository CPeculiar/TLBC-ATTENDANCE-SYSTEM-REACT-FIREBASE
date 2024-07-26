import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from '../Services/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('email', '==', email));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          setMessage('No account found with that email address.');
        } else {
          await sendPasswordResetEmail(auth, email);
          setMessage('We have sent a mail to your email address for steps to take to recover your password. Please check your mail. Blessings');
        }
      } catch (error) {
        console.error('Error sending password reset email:', error);
        if (error.code === 'auth/missing-email') {
            alert('Failed to send password reset email: Missing email.');
          } else if (error.code === 'auth/invalid-email') {
            alert('Failed to send password reset email: Invalid email.');
          } else {
            alert('Failed to send password reset email: ' + error.message);
          }
        }
      };

// const handleSubmit = async (e) => {
//     e.preventDefault();
//     const auth = getAuth();
//     try {
//       await sendPasswordResetEmail(auth, email);
//       setMessage('We have sent a mail to your email address for steps to take to recover your password. Please check your mail. Blessings');
//     } catch (error) {
//       console.error('Error sending password reset email:', error);
//       alert('Failed to send password reset email: ' + error.message);
//     }
//   };

    return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title text-center mb-4">Forgot Password</h2>
                  {message ? (
                    <p className="text-success">{message}</p>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <input 
                          type="email" 
                          className="form-control"
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="Email" 
                          required 
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-100">Send Reset Email</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

export default ForgotPassword;
