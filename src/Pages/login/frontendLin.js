import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import {
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithEmailAndPassword
} from "firebase/auth";
import { auth } from '../../firebase';
import image from './login.png'; // Adjust the path as necessary

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user.emailVerified) {
                navigate('/homepage'); // Redirect to homepage after successful login
            } else {
                setError('Please verify your email before logging in.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate('/homepage'); // Redirect to homepage after successful Google sign-in
        } catch (err) {
            setError("Google sign-in failed: " + err.message);
        }
    };

    const handleFacebookSignIn = async () => {
        setError('');
        const provider = new FacebookAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate('/homepage'); // Redirect to homepage after successful Facebook sign-in
        } catch (err) {
            setError("Facebook sign-in failed: " + err.message);
        }
    };

    return (
        <div className="flex flex-wrap">
            <div className="w-full md:w-1/2 flex justify-center items-center">
                <img src={image} alt="Login" className="object-cover w-85p h-85p rounded-large" />
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center p-12">
                <div className="w-full max-w-md">
                    <h2 className="text-4xl font-bold text-center mb-8">Log In</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <button onClick={handleGoogleSignIn} className="mb-10 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                        <FaGoogle className="mr-2" /> Continue with Google
                    </button>
                    <button onClick={handleFacebookSignIn} className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-800 hover:bg-blue-900">
                        <FaFacebookF className="mr-2" /> Continue with Facebook
                    </button>
                    <div className="flex items-center justify-between mt-4 mb-6">
                        <span className="w-1/5 border-b lg:w-1/4"></span>
                        <p className="text-xs text-center text-gray-500 uppercase">or login with email</p>
                        <span className="w-1/5 border-b lg:w-1/4"></span>
                    </div>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mt-4 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            className="w-full px-4 py-2 mt-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:bg-green-700"
                        >
                            Log in
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <a href="#" className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
                    </div>
                    <div className="text-center mt-4 text-sm text-gray-500">
                        Don't have an account? <a href="/signup" className="text-blue-600 hover:underline">Signup now.</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
