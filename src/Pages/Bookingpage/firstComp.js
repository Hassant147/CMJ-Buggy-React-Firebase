import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { CalendarIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import BuggyModel from '../../Models/buggyModel';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import PhoneVerificationDialog from './OtpDialogBox'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom';
import { id } from 'date-fns/locale';

const FirstComponent = ({ buggy }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [availableDates, setAvailableDates] = useState([]);
    const sliderRef = useRef(null);
    const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([]);
    const [visibleSlots, setVisibleSlots] = useState(10);
    const [buggyDetails, setBuggyDetails] = useState(buggy || {});
    const [isPhoneVerificationOpen, setIsPhoneVerificationOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({}); // State to hold booking details
    const navigate = useNavigate();

    // State to manage quantities for each slot
    const [slotQuantities, setSlotQuantities] = useState({});

    // Fetch buggies and their document IDs from Firestore
    useEffect(() => {
        const fetchBuggies = async () => {
            const db = getFirestore();
            const querySnapshot = await getDocs(collection(db, "Buggies"));
            const buggiesWithIds = querySnapshot.docs.map((doc) => ({
                id: doc.id,  // Store document ID
                ...doc.data(),
            }));

            if (buggiesWithIds.length > 0) {
                setBuggyDetails(buggiesWithIds[0]); // First buggy in the array is set to state
            }
        };

        fetchBuggies();
    }, []);

    useEffect(() => {
        if (buggy?.schedule) {
            // Fetch and format available dates from BuggyModel
            const availableSlots = BuggyModel.getAvailableSlotsWithLowestPrice(buggy.schedule);
            setAvailableDates(availableSlots.map(slot => ({
                ...slot,
                date: moment(slot.date, 'ddd - DD MMM YYYY').format('YYYY-MM-DD') // Convert to ISO format
            })));
        }
    }, [buggy]);

    // Initialize slot quantities state with a default quantity of 1
    useEffect(() => {
        const initialQuantities = {};
        slotsForSelectedDate.forEach((_, index) => {
            initialQuantities[index] = 1; // Set default quantity to 1
        });
        setSlotQuantities(initialQuantities);
    }, [slotsForSelectedDate]);

    // Update the useEffect hook that fetches the slots for the selected date
    useEffect(() => {
        if (buggy?.schedule && buggy.plateNumber) {
            const formattedSelectedDate = moment(selectedDate).format('ddd - DD MMM YYYY');
            let slots = BuggyModel.calculateAvailableBuggiesForDate(buggy.schedule, buggy.plateNumber, formattedSelectedDate);

            // Filter out slots where no number plates are available
            slots = slots.filter(slot => slot.availableBuggies > 0);

            // Convert 'New Price' to a number for each slot
            slots = slots.map(slot => ({
                ...slot,
                'New Price': Number(slot['New Price']) // Ensuring 'New Price' is a number
            }));

            // Update the state to reflect the available slots
            setSlotsForSelectedDate(slots);

            // Initialize quantities to 1 for each available slot
            const initialQuantities = slots.reduce((acc, _, index) => {
                acc[index] = 1; // Start with a quantity of 1
                return acc;
            }, {});

            setSlotQuantities(initialQuantities);
        }
    }, [selectedDate, buggy?.schedule, buggy?.plateNumber]);


    const handleDateChange = (date) => {
        setSelectedDate(date);
        setShowDatePicker(false);
    };

    const handleCalendarClick = () => {
        setShowDatePicker(!showDatePicker);
    };

    const scrollSlider = (direction) => {
        const sliderElement = sliderRef.current;
        if (sliderElement) {
            // Assuming each card has a width of 96 (w-24) and margin of 8 (mx-2) on each side
            const cardWidth = 96 + 8 * 2; // This should match the total width of the card including margin
            const scrollAmount = cardWidth; // Scroll exactly one card width
            sliderElement.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
        }
    };

    // Initialize slot quantities state
    useEffect(() => {
        console.log("Slots for Selected Date: ", slotsForSelectedDate);
        const initialQuantities = {};
        slotsForSelectedDate.forEach((_, index) => {
            initialQuantities[index] = 1; // Set default quantity to 1
        });
        console.log("Initial Quantities: ", initialQuantities);
        setSlotQuantities(initialQuantities);
    }, [slotsForSelectedDate]);


    // Increment function with price calculation
    const incrementQuantity = (index) => {
        setSlotQuantities(prevQuantities => {
            const maxQuantity = slotsForSelectedDate[index].availableBuggies;
            let newQuantity = prevQuantities[index];

            if (newQuantity < maxQuantity) {
                newQuantity++;
            } else {
                // console.log(`Cannot book more than available buggies. Max: ${maxQuantity}`);
            }

            return {
                ...prevQuantities,
                [index]: newQuantity
            };
        });
    };

    // Decrement function with price calculation
    const decrementQuantity = (index) => {
        setSlotQuantities(prevQuantities => {
            let newQuantity = prevQuantities[index];

            if (newQuantity > 1) { // Ensure the quantity never goes below 1
                newQuantity--;
            }

            return {
                ...prevQuantities,
                [index]: newQuantity
            };
        });
    };

    // Function to handle booking
    const handleBooking = (slot, index) => {
        const quantity = slotQuantities[index];
        const newPrice = Number(slot['New Price']);
        const totalAmount = newPrice * quantity;

        // Prepare the essential booking details
        const bookingDetails = {
            buggyId: buggyDetails.id, // Accessing the document ID from the buggyDetails state
            selectedDate: moment(selectedDate).format('ddd - DD MMM YYYY'), // Selected date
            slot: { // Complete slot information as per your structure
                startTime: slot['Start Time'],
                endTime: slot['End Time'],
                newPrice: slot['New Price'],
                oldPrice: slot['Old Price'] || "", // Include old price if exists
                isExclusive: slot['Is Exclusive'],
            },
            quantity: quantity,
            totalAmount: totalAmount
        };
        // console.log("Booking Details:", bookingDetails); // Debugging log
        setBookingDetails(bookingDetails); // Store booking details
        console.log(bookingDetails)

        // Navigate to the PaymentPage with the booking details
        navigate('/payment', { state: { bookingDetails } });
        console.log('HELLO===========>', bookingDetails)

        // setIsPhoneVerificationOpen(true);

    };
    // ==================================================================================================================================================================
    const [timings, setTimings] = useState([]);

    useEffect(() => {
        const fetchTimings = async () => {
            const db = getFirestore();
            const timingsSnapshot = await getDocs(collection(db, "Timings"));
            const timingsData = timingsSnapshot.docs.map(doc => doc.data());
            setTimings(timingsData);
        };

        fetchTimings();
    }, []);

    const getSlotCategory = () => {
        const currentTime = moment(); // Get current time

        for (let timing of timings) {
            const timingStart = moment(timing['Start Time'], 'h:mm A');
            const timingEnd = moment(timing['End Time'], 'h:mm A');

            if (currentTime.isSameOrAfter(timingStart) && currentTime.isSameOrBefore(timingEnd)) {
                return timing.Title.toLowerCase(); // Returns 'morning', 'afternoon', etc.
            }
        }

        return 'default'; // Default category if none matches
    };

    // Define colors for different slot categories
    const slotColors = {
        morning: 'bg-blue-100',
        afternoon: 'bg-amber-50',
        evening: 'bg-orange-50',
        night: 'bg-gray-100',
        default: 'bg-white'
    };

    return (
        <div className="bg-white p-4 mt-28 relative mb-12">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                    {buggy?.name} - {buggy?.duration}
                </h2>
                <button
                    className="flex items-center justify-center bg-blue-500 text-white rounded-md px-3 py-1"
                    onClick={handleCalendarClick}
                >
                    <CalendarIcon className="h-5 w-5" />
                    <span className="ml-2">Calendar</span>
                </button>
            </div>
            {showDatePicker && (
                <div className="absolute right-0 z-30">
                    <DatePicker
                        inline
                        selected={selectedDate}
                        onChange={handleDateChange}
                    />
                </div>
            )}
            <div className="flex items-center justify-between my-4 gap-x-10 lg:gap-x-2">
                <button
                    onClick={() => scrollSlider('left')}
                    className="z-20 rounded-full border border-gray-300 p-2 flex items-center justify-center"
                    aria-label="Scroll Left"
                >
                    <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
                </button>
                <div className="flex overflow-x-auto" ref={sliderRef}>
                    {availableDates.length > 0 ? (
                        availableDates.map((dateEntry, index) => {
                            const formattedDate = moment(dateEntry.date).format('DD MMMM');
                            return (
                                <button
                                    key={index}
                                    className={`mx-2 w-24 md:w-40 h-24 rounded-lg px-4 md:px-20 flex flex-col items-center justify-center ${moment(selectedDate).format('DD MMMM') === formattedDate ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                    onClick={() => setSelectedDate(new Date(dateEntry.date))}
                                >
                                    <span className="text-sm font-semibold">{formattedDate}</span>
                                    <span className="text-xs">{dateEntry.lowestPrice || 'N/A'}</span>
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-700">No available slots</div>
                    )}
                </div>
                <button
                    onClick={() => scrollSlider('right')}
                    className="z-20 rounded-full border border-gray-300 p-2 flex items-center justify-center"
                    aria-label="Scroll Right"
                >
                    <ArrowRightIcon className="h-5 w-5 text-gray-500" />
                </button>
            </div>
            <div className="mt-4 space-y-4">
                {slotsForSelectedDate.slice(0, visibleSlots).map((slot, index) => {
                    const totalPrice = slot['New Price'] * slotQuantities[index]; // Calculate total price based on quantity
                    const slotCategory = getSlotCategory(slot['Start Time'], slot['End Time']);
                    const bgColor = slotColors[slotCategory] || slotColors.default; // Calculate bgColor here                
                    return (
                        <div key={index} className={`flex flex-col md:grid md:grid-cols-12 gap-4 items-center border-b-2 py-4 px-10 rounded-md  ${bgColor}`}>
                            <div className="md:col-span-3">
                                <div className="text-sm text-gray-600 mb-1">{moment(selectedDate).format('DD MMMM')}</div>
                                <div className="flex items-center">
                                    <span className="text-lg font-bold">{slot['Start Time']}</span>
                                    <div className="border-b border-dotted border-gray-400 flex-grow mx-2"></div>
                                    <span className="text-lg font-bold">{slot['End Time']}</span>
                                </div>
                            </div>
                            <div className="md:col-span-3 flex items-center lg:justify-center justify-start">
                                <button onClick={() => decrementQuantity(index)} className="bg-gray-200 text-gray-600 px-2 py-1 rounded">-</button>
                                <span className="mx-2 text-lg">{slotQuantities[index]}</span>
                                <button onClick={() => incrementQuantity(index)} className="bg-gray-200 text-gray-600 px-2 py-1 rounded">+</button>
                            </div>
                            <div className="md:col-span-3 lg:text-center text-left">
                                <span className="text-xl font-bold text-green-600">{totalPrice} AED</span>
                            </div>
                            <div className="md:col-span-3 text-center md:text-right">
                                <button
                                    onClick={() => handleBooking(slot, index)}
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    );
                })}
                {slotsForSelectedDate.length > visibleSlots && (
                    <div className="text-center my-4">
                        <button onClick={() => setVisibleSlots(prev => prev + 10)} className="text-md bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            View More
                        </button>
                    </div>
                )}
            </div>
            {/* Phone Verification Dialog */}
            <PhoneVerificationDialog
                isOpen={isPhoneVerificationOpen}
                onClose={() => setIsPhoneVerificationOpen(false)}
                bookingDetails={bookingDetails}
            />
        </div>
    );
};

export default FirstComponent;