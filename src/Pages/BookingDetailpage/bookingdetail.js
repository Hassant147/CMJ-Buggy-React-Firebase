import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getFirestore, doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Footer from '../../Components/footer';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { auth, db } from "../../firebase";
import QRCode from 'qrcode.react';
import ConfirmationDialog from './Dialogbox';
import LoadingIndicator from './LoadingIndicator';

const stripePromise = loadStripe('pk_test_51Nryh0JD5tRixJhxaazlRnG4EoK0PRdvsCnwhY9o8joJE6dCtEv19Vx2Ut6UvfJ0MYta2XHomA7iPmlZz83G23c200B5MAldmd'); // Use your Stripe publishable key


const PaymentPage = () => {
    const location = useLocation();
    const [buggyDetails, setBuggyDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const bookingDetails = location.state?.bookingDetails || {};
    const stripe = useStripe();
    const elements = useElements();
    const [qrCodeData, setQrCodeData] = useState('');
    const [showQRModal, setShowQRModal] = useState(false);
    const qrRef = useRef();
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        const fetchBuggyDetails = async () => {
            if (bookingDetails?.buggyId) {
                setLoading(true);
                try {
                    const db = getFirestore();
                    const docRef = doc(db, "Buggies", bookingDetails.buggyId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Extract the first image URL of the first plate number
                        const firstPlateImages = data["Plate No With Images"] ? Object.values(data["Plate No With Images"])[0] : [];
                        const firstImageUrl = firstPlateImages.length > 0 ? firstPlateImages[0] : 'default-image-url';
                        setBuggyDetails({ ...data, firstImageUrl });
                    } else {
                        console.log("No such buggy found!");
                    }
                } catch (error) {
                    console.error("Error fetching buggy details:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBuggyDetails();
    }, [bookingDetails?.buggyId]);

    // Function to get current user's ID and phone number
    function getCurrentUserDetails() {
        const user = auth.currentUser;
        if (user) {
            return {
                uid: user.uid,
                phoneNumber: user.phoneNumber || '' // Fetches phone number, returns an empty string if not available
            };
        }
        return { uid: null, phoneNumber: '' };
    }

    const handlePaymentSubmit = async (event) => {
        console.log("handlePaymentSubmit started");
        event.preventDefault();
        if (isProcessingPayment) return;
        setIsProcessingPayment(true);

        if (!stripe || !elements || isLoading) {
            console.log("Payment is either already in progress or Stripe hasn't loaded yet.");
            setIsProcessingPayment(false);
            return;
        }

        setIsLoading(true);

        const cardElement = elements.getElement(CardElement);

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                console.error('Error:', error);
                setIsLoading(false);
                setIsProcessingPayment(false);
                return;
            }

            const latestBuggyDetails = await fetchBuggyDetails(bookingDetails.buggyId);
            if (!latestBuggyDetails) {
                alert("Failed to fetch latest buggy details. Please try again.");
                setIsLoading(false);
                setIsProcessingPayment(false);
                return;
            }

            const isSlotAvailable = checkSlotAvailability(latestBuggyDetails, bookingDetails);
            if (!isSlotAvailable) {
                alert("Selected slot is already booked. Please choose another slot.");
                setIsLoading(false);
                setIsProcessingPayment(false);
                return;
            }

            const response = await fetch('https://us-central1-cmj-buggy.cloudfunctions.net/createPaymentIntent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: bookingDetails.totalAmount * 100, // Convert to cents
                    currency: 'aed',
                }),
            });

            const paymentIntent = await response.json();

            const { error: confirmError } = await stripe.confirmCardPayment(paymentIntent.client_secret, {
                payment_method: paymentMethod.id,
            });

            if (confirmError) {
                console.error('Payment confirmation error:', confirmError);
                setIsLoading(false); // Stop loading indicator on error
                setIsProcessingPayment(false);
                return;
            } else {
                console.log('Payment successful:', paymentIntent);
                console.log('buggy details:', buggyDetails);
                console.log('booking details:', bookingDetails);

                // The rest of your booking logic here
                let bookedPlateNumbers = bookingDetails.slot.bookedPlateNumbers || [];
                const allPlateNumbers = buggyDetails["Plate Number"] || [];
                const selectedPlateNumbers = selectAvailablePlateNumbers(bookedPlateNumbers, allPlateNumbers, bookingDetails.quantity);

                const plateNumberWithImages = {};
                let allImageUrls = []; // Array to store all image URLs

                selectedPlateNumbers.forEach(plateNumber => {
                    const imagesForPlate = buggyDetails["Plate No With Images"][plateNumber];
                    if (imagesForPlate) {
                        plateNumberWithImages[plateNumber] = imagesForPlate;
                        allImageUrls = [...allImageUrls, ...imagesForPlate]; // Add images to the allImageUrls array
                    }
                });

                // Get the current user's details
                const { uid, phoneNumber } = getCurrentUserDetails();

                const bookingData = {
                    'Reservation Number': generateUniqueReservationNumber(),
                    'Buggy Model': buggyDetails.Model,
                    'Buggy Name': buggyDetails.Name,
                    'Duration': buggyDetails.Duration,
                    'Company Name': buggyDetails.Company,
                    'Arrival Date': bookingDetails.selectedDate,
                    'Payment Date': new Date().toISOString(),
                    'Total Amount': bookingDetails.totalAmount.toString(),
                    'Slot': {
                        'End Time': bookingDetails.slot.endTime,
                        'Is Exclusive': bookingDetails.slot.isExclusive,
                        'New Price': bookingDetails.slot.newPrice.toString(),
                        'Old Price': bookingDetails.slot.oldPrice.toString(),
                        'Start Time': bookingDetails.slot.startTime,
                        'Booked Plate Numbers': selectedPlateNumbers,
                    },
                    'Location': buggyDetails.Location,
                    'Formatted Address': await getAddressFromCoordinates(buggyDetails.Location.Lat, buggyDetails.Location.Long) || '',
                    'Quantity': bookingDetails.quantity.toString(),
                    'Plate Numbers': buggyDetails["Plate Number"],
                    'Cashier Uid': buggyDetails["Cashier Uid"],
                    'Company Uid': buggyDetails["Company Uid"],
                    'Buggy Uid': bookingDetails.buggyId,
                    'Image Url': allImageUrls, // Array of all image URLs from selected plate numbers
                    'Uid': uid,
                    'Phone Number': phoneNumber,                    
                    'Timestamp': new Date(),
                    'Is Started': false,
                    'Is Ride Started': false,
                    'Is Ride Ended': false,
                    'Is Ended': false,
                    'Home Location': {},
                    'Live Location': {},
                    'Plate Number With Images': plateNumberWithImages,
                    'Vehicle Replacement at Index': null,
                    'Countdown Start Time': Date.now(),
                };

                try {
                    const bookingUid = await addBookingToFirestore(bookingData);
                    await updateBuggySchedule(bookingDetails.buggyId, bookingDetails.selectedDate, bookingDetails.slot, selectedPlateNumbers);
                    onPaymentSuccess({ bookingUid }); // Pass the UID to onPaymentSuccess
                    setIsLoading(false); // Stop loading indicator on success
                    // Do not set isProcessingPayment to false here
                } catch (err) {
                    console.error('Error during booking process:', err);
                    setIsLoading(false); // Stop loading indicator on error
                    setIsProcessingPayment(false); // Re-enable button on error
                }
            }
        } catch (err) {
            console.error('Error during payment or booking process:', err);
            setIsLoading(false); // Stop loading indicator on error
            setIsProcessingPayment(false); // Re-enable button on error
        }
    };

    // Function to check slot availability
    function checkSlotAvailability(latestBuggyDetails, bookingDetails) {
        console.log("Latest Buggy Details:", latestBuggyDetails);
        console.log("Booking Details:", bookingDetails);

        let selectedDateSlots = null;
        for (let dateSlot of latestBuggyDetails.Schedule) {
            if (dateSlot.hasOwnProperty(bookingDetails.selectedDate)) {
                selectedDateSlots = dateSlot[bookingDetails.selectedDate];
                break;
            }
        }

        if (!selectedDateSlots) {
            console.log("No slots found for the selected date.");
            return false;
        }

        console.log("Selected Date Slots:", selectedDateSlots);

        const selectedSlot = selectedDateSlots.find(slot => {
            const isStartTimeMatch = slot['Start Time'] === bookingDetails.slot.startTime;
            const isEndTimeMatch = slot['End Time'] === bookingDetails.slot.endTime;
            console.log(`Checking slot: Start Time - ${slot['Start Time']}, End Time - ${slot['End Time']}, Matches: ${isStartTimeMatch && isEndTimeMatch}`);
            return isStartTimeMatch && isEndTimeMatch;
        });

        if (!selectedSlot) {
            console.log("Selected slot not found.");
            return false;
        }

        const bookedPlateNumbers = selectedSlot['Booked Plate Numbers'] || [];
        const totalPlateNumbers = latestBuggyDetails["Plate Number"].length;
        const availableSlots = totalPlateNumbers - bookedPlateNumbers.length;
        const isAvailable = bookingDetails.quantity <= availableSlots;

        console.log("Available Slots:", availableSlots, "Is Slot Available:", isAvailable);

        return isAvailable;
    }

    // Function to fetch latest buggy details from Firebase
    async function fetchBuggyDetails(buggyId) {
        try {
            const db = getFirestore();
            const docRef = doc(db, "Buggies", buggyId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                console.log("No such buggy found!");
                return null;
            }
        } catch (error) {
            console.error("Error fetching buggy details:", error);
            return null;
        }
    }

    function selectAvailablePlateNumbers(bookedPlates, allPlates, quantity) {
        const availablePlates = allPlates.filter(plate => !bookedPlates.includes(plate));
        return availablePlates.slice(0, quantity);
    }

    // Implement these utility functions as per your application logic
    function generateUniqueReservationNumber() {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 100000);
        return `${timestamp}-${randomNum}`;
    }

    async function getAddressFromCoordinates(lat, lng) {
        const apiKey = 'AIzaSyCu5PAEA67AyjBQRFQzTIQOG7Oxm3HiUOw'; // Replace with your API key
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK') {
                // Extract the formatted address from the first result
                return data.results[0].formatted_address;
            } else {
                console.error('Geocoding error:', data.status);
                return ''; // Return an empty string or handle error as needed
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            return ''; // Return an empty string or handle error as needed
        }
    }


    async function addBookingToFirestore(bookingData) {
        try {
            const bookingRef = await addDoc(collection(db, "Bookings"), bookingData);
            return bookingRef.id; // Return the document ID
        } catch (error) {
            console.error("Error adding booking to Firestore: ", error);
        }
    }


    async function updateBuggySchedule(buggyId, selectedDate, selectedSlot, bookedPlateNumbers) {
        console.log("Updating schedule for Buggy ID:", buggyId);
        console.log("Selected Date:", selectedDate);
        console.log("Selected Slot:", selectedSlot);
        console.log("Booked Plate Numbers:", bookedPlateNumbers);

        try {
            const buggyRef = doc(db, "Buggies", buggyId);
            const buggySnap = await getDoc(buggyRef);

            if (!buggySnap.exists()) {
                console.error('No such buggy found!');
                return;
            }

            const buggyData = buggySnap.data();
            let schedule = buggyData.Schedule || [];
            let dateFound = false, slotFound = false;

            // Ensure the prices are compared as strings
            const selectedSlotNewPriceAsString = String(selectedSlot.newPrice);

            for (let dateObj of schedule) {
                const dateKey = Object.keys(dateObj)[0];
                if (dateKey === selectedDate) {
                    dateFound = true;
                    let slots = dateObj[selectedDate];

                    for (let slot of slots) {
                        // Compare only the essential properties, and ensure their types match
                        const slotNewPriceAsString = String(slot['New Price']);
                        if (slot['Start Time'] === selectedSlot.startTime &&
                            slot['End Time'] === selectedSlot.endTime &&
                            slotNewPriceAsString === selectedSlotNewPriceAsString &&
                            slot['Is Exclusive'] === selectedSlot.isExclusive) {
                            console.log("Matching slot found, updating booked plate numbers");
                            slot['Booked Plate Numbers'] = [...(slot['Booked Plate Numbers'] || []), ...bookedPlateNumbers];
                            slotFound = true;
                            break; // Correct slot found, exit the slots loop
                        }
                    }
                    if (slotFound) {
                        console.log("Slot updated successfully");
                        // Only update the document if the slot was found and updated
                        await updateDoc(buggyRef, { Schedule: schedule });
                        console.log("Buggy schedule updated successfully");
                        break; // Correct date and slot found, exit the dates loop
                    }
                }
            }

            if (!dateFound || !slotFound) {
                console.error('Date or Slot not found in schedule!');
                // Handle the error appropriately
            }
        } catch (error) {
            console.error("Error updating buggy schedule:", error);
        }
    }

    // This function is called after successful payment and booking data storage
    const onPaymentSuccess = (booking) => {
        const qrData = `${booking.bookingUid}+START`;
        console.log(booking)
        console.log(booking.bookingUid)
        setQrCodeData(qrData);
        setShowConfirmationDialog(true); // Show confirmation dialog
        setShowQRModal(false); // Ensure QR modal is not shown yet
    };

    // Function to download QR code as an image
    const downloadQRCode = () => {
        const canvas = qrRef.current.querySelector('canvas');
        const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        const link = document.createElement('a');
        link.href = image;
        link.download = 'qr-code.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Modal Component for QR Code
    const QRCodeModal = () => {
        if (!showQRModal) return null;
        return (<div style={{
            display: showQRModal ? 'block' : 'none',
            position: 'fixed',
            zIndex: 1000,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
        }}>
            <h2 style={{ marginBottom: '20px' }}>QR Code</h2>
            <div style={{ marginBottom: '20px' }} ref={qrRef}>
                {qrCodeData && <QRCode value={qrCodeData} size={256} level={"H"} />}
            </div>
            <button onClick={downloadQRCode} style={{
                marginRight: '10px',
                padding: '10px 20px',
                fontSize: '16px',
                borderRadius: '5px',
                cursor: 'pointer',
                background: '#4CAF50',
                color: 'white',
                border: 'none'
            }}>Download QR Code</button>
            <button onClick={() => setShowQRModal(false)} style={{
                padding: '10px 20px',
                fontSize: '16px',
                borderRadius: '5px',
                cursor: 'pointer',
                background: '#f44336',
                color: 'white',
                border: 'none'
            }}>Close</button>
        </div>
        );
    };


    if (loading) {
        return <div>Loading...</div>;
    }
    // Added styles inline for simplicity, but you should create CSS classes for these
    const style = {
        container: {
            maxWidth: '1200px',
            margin: 'auto',
            padding: '5rem',

            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
        },
        header: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
        },
        section: {
            marginRight: '50px',
            background: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
        },
        formInput: {
            width: '100%',
            padding: '0.5rem',
            margin: '0.5rem 0',
            borderRadius: '4px',
            border: '1px solid #ddd',
        },
        submitButton: {
            width: '100%',
            padding: '1rem',
            border: 'none',
            borderRadius: '4px',
            background: '#4CAF50',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
        },
        flexRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
        },
        flexCol: {
            display: 'flex',
            flexDirection: 'column',
        },
        image: {
            width: '80px',
            height: '80px',
            marginRight: '1rem',
        },
        orderItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            paddingBottom: '1rem',
            marginBottom: '1rem',
        },
        orderTotal: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '1.25rem',
            fontWeight: 'bold',
        },
        formSection: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        },
    };

    return (
        <div>
            {isLoading && <LoadingIndicator />}
            <div style={style.container}>
                <div style={style.flexRow}>
                    <div style={{ ...style.section, flexBasis: '50%' }}>
                        <h2 style={style.header}>Order Summary</h2>
                        <div style={style.orderItem}>
                            <div style={style.flexRow}>
                                <img
                                    src={buggyDetails.firstImageUrl}
                                    alt="Buggy"
                                    style={style.image}
                                />
                                <div style={style.flexCol}>
                                    <h3>{buggyDetails.Name}</h3>
                                    <p>{buggyDetails.Duration}</p>
                                </div>
                            </div>
                            <div style={style.flexCol}>
                                <p>{bookingDetails.quantity} x AED {bookingDetails.slot.newPrice}</p>
                                <p>{bookingDetails.slot.startTime} - {bookingDetails.slot.endTime}</p>
                            </div>
                        </div>
                        <div style={style.orderTotal}>
                            <span>Order Total:</span>
                            <span>AED {bookingDetails.totalAmount}</span>
                        </div>
                    </div>

                    <div style={{ ...style.section, flexBasis: '50%' }}>
                        <h2 style={style.header}>Payment Information</h2>
                        <form onSubmit={handlePaymentSubmit} style={style.formSection}>
                            <input
                                style={style.formInput}
                                type="email"
                                placeholder="Email ID"
                                required
                            />
                            {/* Replace your card input fields with Stripe's CardElement */}
                            <div style={{ ...style.formInput, padding: '0' }}> {/* Adjust this style as needed */}
                                <CardElement options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: '#424770',
                                            '::placeholder': {
                                                color: '#aab7c4',
                                            },
                                        },
                                        invalid: {
                                            color: '#9e2146',
                                        },
                                    },
                                }} />
                            </div>
                            <input
                                style={style.formInput}
                                type="text"
                                placeholder="Name on Card"
                                required
                            />
                            <input
                                style={style.formInput}
                                type="text"
                                placeholder="Billing Address"
                                required
                            />
                            <button
                                style={style.submitButton}
                                type="submit"
                                disabled={!stripe || isProcessingPayment}
                            >
                                Checkout
                            </button>
                        </form>
                    </div>
                </div>
                <ConfirmationDialog
                    isVisible={showConfirmationDialog}
                    onConfirm={() => {
                        setShowConfirmationDialog(false); // Close confirmation dialog
                        setShowQRModal(true); // Open QR code modal
                    }}
                />
                <QRCodeModal />
            </div>
            <Footer />
        </div>
    );
};

export default PaymentPage;

