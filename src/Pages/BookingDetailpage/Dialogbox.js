// ConfirmationDialog.js
import React from 'react';
// Importing icon from Heroicons v2
import CustomIcon from '../../Pages/BookingDetailpage/Group 2061.png'; // Adjust the path as necessary

const ConfirmationDialog = ({ isVisible, onConfirm }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="bg-white p-4 md:p-6 lg:p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
                <img src={CustomIcon} alt="Success" className="h-12 w-12 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-900 mt-4">Your Booking has been Placed!</h2>
                <p className="text-gray-500 mt-2">
                    Thank you for your purchase! Now we're giving you the QR Code with reference number. If you
                    would like to cancel this booking, please let us know within 24 hours.
                </p>
                <button
                    onClick={onConfirm}
                    className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:bg-green-700 transition-colors w-full"
                >
                    View QR Code
                </button>
            </div>
        </div>
    );
};

export default ConfirmationDialog;

