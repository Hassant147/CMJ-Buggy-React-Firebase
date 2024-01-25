import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from '../../src/firebase'; // Adjust the path as necessary
import { toast, Toaster } from "react-hot-toast";

const DialogBox = ({ onClose }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);

    useEffect(() => {
        window.recaptchaVerifier = new RecaptchaVerifier(
            'recaptcha-container', {
                size: 'invisible',
                callback: (response) => {
                    console.log("reCAPTCHA solved", response);
                },
            },
            auth
        );
        window.recaptchaVerifier.render().catch((error) => {
            console.error("Error rendering reCAPTCHA:", error);
        });
    }, []);

    const handleVerifyClick = () => {
        setLoading(true);
        const appVerifier = window.recaptchaVerifier;
        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                setLoading(false);
                setShowOTP(true);
                toast.success("OTP sent successfully!");
            })
            .catch((error) => {
                console.error("Error during phone number sign in:", error);
                setLoading(false);
                toast.error("Failed to send OTP.");
            });
    };

    const handleOTPSubmit = () => {
        setLoading(true);
        window.confirmationResult.confirm(otp)
            .then((result) => {
                console.log("User signed in:", result.user);
                setLoading(false);
                onClose(); // Close the dialog or handle further user actions
            })
            .catch((error) => {
                console.error("Error during OTP verification:", error);
                setLoading(false);
                toast.error("Failed to verify OTP.");
            });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div id="recaptcha-container"></div> {/* Invisible reCAPTCHA container */}
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <Toaster toastOptions={{ duration: 4000 }} />
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Phone Verification</h3>
                    <div className="mt-2 px-7 py-3">
                        {showOTP ? (
                            <input
                                type="text"
                                className="px-3 py-2 w-full border rounded focus:outline-none focus:shadow-outline"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        ) : (
                            <input
                                type="text"
                                className="px-3 py-2 w-full border rounded focus:outline-none focus:shadow-outline"
                                placeholder="Enter Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        )}
                    </div>
                    <div className="items-center px-4 py-3">
                        {showOTP ? (
                            <button
                                className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                onClick={handleOTPSubmit}
                            >
                                Verify OTP
                            </button>
                        ) : (
                            <button
                                id="sign-in-button"
                                className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                                onClick={handleVerifyClick}
                            >
                                Send OTP
                            </button>
                        )}
                        <button
                            id="cancel-btn"
                            className="mt-3 px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DialogBox;
