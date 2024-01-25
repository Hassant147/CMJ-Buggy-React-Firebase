import React, { useState, useEffect } from 'react';
// import firebase from '../../firebase'; // Import the firebase instance from the firebase module
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import HeroImage from './firstCompMedia/bg.png';
import BuggiesIcon from './firstCompMedia/Frame 13.png';
import BestPriceIcon from './firstCompMedia/Frame 14.png';
import FastBookingIcon from './firstCompMedia/Frame 16.png';

const HeroSection = () => {
    // const [vehicle, setVehicle] = useState('');
    // const [timeOfDay, setTimeOfDay] = useState('');
    // const [duration, setDuration] = useState('');
    // const navigate = useNavigate(); // useNavigate hook for navigation

    // // Handler for the search button
    // const handleSearch = () => {
    //     // Navigate to the new page with the search parameters
    //     navigate(`/search-results?vehicle=${vehicle}&timeOfDay=${timeOfDay}&duration=${duration}`);
    // };

    return (
        <div className=" bg-green-50 lg:-mt-20">
            {/* Hero Image */}
            <div className="bg-cover bg-center h-96" style={{ backgroundImage: `url(${HeroImage})` }}>
                <div className="bg-black bg-opacity-50 flex justify-center items-center h-full">
                    {/* Search Functionality */}
                    {/* <div className="space-x-2 md:space-x-4 rounded-lg shadow-lg p-4 md:p-6 flex flex-col md:flex-row items-center justify-between" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                        <select className="bg-white text-black rounded px-4 py-3 focus:outline-none flex-1" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                            <option value="">Vehicle</option>
                        </select>
                        <select className="bg-white text-black rounded px-4 py-3 focus:outline-none flex-1" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)}>
                            <option value="">Time of the day</option>
                        </select>
                        <select className="bg-white text-black rounded px-4 py-3 focus:outline-none flex-1" value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value="">Duration</option>
                        </select>
                        <button className="bg-custom-green hover:bg-green-400 text-black py-3 px-6 rounded focus:outline-none flex-none" onClick={handleSearch}>
                            Search Now
                        </button>
                    </div> */}
                </div>
            </div>

            {/* USPs */}
            <div className="flex flex-col md:flex-row justify-around bg-custom-green py-4 text-white">
                <div className="flex flex-col items-center mb-4 md:mb-0 md:flex-row">
                    <img src={BuggiesIcon} alt="100+ Buggies" className="mr-2" />
                    <div>
                        <h3 className="font-bold">100+ Buggies</h3>
                        <p>Morbi leo risus, porta ac</p>
                    </div>
                </div>
                <div className="flex flex-col items-center mb-4 md:mb-0 md:flex-row">
                    <img src={BestPriceIcon} alt="Best Price Guarantee" className="mr-2" />
                    <div>
                        <h3 className="font-bold">Best Price Guarantee</h3>
                        <p>Morbi leo risus, porta ac</p>
                    </div>
                </div>
                <div className="flex flex-col items-center md:flex-row">
                    <img src={FastBookingIcon} alt="Super Fast Booking" className="mr-2" />
                    <div>
                        <h3 className="font-bold">Super Fast Booking</h3>
                        <p>Morbi leo risus, porta ac</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
