import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { RecaptchaVerifier, linkWithPhoneNumber } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import 'react-toastify/dist/ReactToastify.css';

const PhoneVerificationDialog = ({ isOpen, onClose, bookingDetails }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const navigate = useNavigate();
    const [confirmationResult, setConfirmationResult] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setupRecaptcha();
            setIsCodeSent(false); // Reset isCodeSent every time dialog opens
        } else {
            clearRecaptcha(); // Clear reCAPTCHA when dialog closes
        }
    }, [isOpen]);

    const setupRecaptcha = () => {
        clearRecaptcha(); // Clear existing reCAPTCHA instances
        window.recaptchaVerifier = new RecaptchaVerifier(auth,'recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow sendVerificationCode
            }
        });
        window.recaptchaVerifier.render();
    };

    const clearRecaptcha = () => {
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
        }
    };

    const sendVerificationCode = async () => {
        if (!auth.currentUser) {
            toast.error("No user is currently logged in.");
            return;
        }

        try {
            const appVerifier = window.recaptchaVerifier;
            const formattedPhoneNumber = `+${phoneNumber.replace(/\s/g, '')}`;
            console.log("Sending code to: ", formattedPhoneNumber);
            const result = await linkWithPhoneNumber(auth.currentUser, formattedPhoneNumber, appVerifier);
            setConfirmationResult(result);
            setIsCodeSent(true);
        } catch (error) {
            console.error("Error sending verification code: ", error);
            if (error.code === 'auth/account-exists-with-different-credential') {
                toast.error("This phone number is already registered with another user. Please try a different number.");
            } else if (error.code === 'auth/invalid-phone-number') {
                toast.error("Invalid phone number format. Please enter a valid phone number.");
            } else {
                toast.error("Failed to send verification code. Please try again.");
            }
        }
    };

    const handleVerify = async () => {
        if (!confirmationResult) {
            toast.error("Verification process not initialized. Please resend the code.");
            return;
        }

        try {
            const response = await confirmationResult.confirm(verificationCode);
            console.log("Phone number linked: ", response.user);
            toast.success("Phone number successfully verified.");
            navigate('/payment', { state: { bookingDetails } });
            onClose();
        } catch (error) {
            console.error("Error verifying phone number: ", error);
            if (error.code === 'auth/invalid-verification-code') {
                toast.error("You entered an invalid verification code. Please try again.");
            } else {
                toast.error("Error occurred. Please try again.");
            }
            setIsCodeSent(false);
        }
    };

    return (
        <div className={`absolute inset-0 bg-gray-600 bg-opacity-50 ${!isOpen && 'hidden'}`} onClick={onClose}>
            <div className="bg-white p-4 rounded shadow-lg m-auto w-1/3" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">Phone Verification</h2>
                <PhoneInput
                    country={'us'}
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    disabled={isCodeSent}
                    inputClass="mb-4 p-2 border rounded w-full"
                />
                {isOpen && <div id="recaptcha-container"></div>} {/* Render reCAPTCHA container conditionally */}
                {!isCodeSent ? (
                    <button
                        className="bg-blue-500 text-white p-2 rounded mt-2"
                        onClick={sendVerificationCode}
                    >
                        Send Code
                    </button>
                ) : (
                    <input
                        type="text"
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="mb-4 p-2 border rounded w-full"
                    />
                )}
                {isCodeSent && (
                    <button
                        className="bg-green-500 text-white p-2 rounded"
                        onClick={handleVerify}
                    >
                        Verify
                    </button>
                )}
            </div>
            <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default PhoneVerificationDialog;
