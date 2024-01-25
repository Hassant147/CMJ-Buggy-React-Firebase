import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust this path to your Firebase config
import BuggyModel from '../../Models/buggyModel'; // Adjust this path to your BuggyModel class
import CompanyModel from '../../Models/CompanyModel'; // Adjust this import path to your CompanyModel file
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Shimmer from '../../Components/Shimmer/Shimmer';
import backgroundImage from './firstCompMedia/bg6comp.png'; // Replace with your image path

// BuggyCard Component
const BuggyCard = ({ buggy }) => {
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                i <= rating ? <FaStar key={i} className="text-yellow-400" /> : <FaRegStar key={i} className="text-gray-300" />
            );
        }
        return stars;
    };

    const imageUrl = buggy.images && buggy.images.length > 0 ? buggy.images[0] : 'default-image-url';

    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate('/bookingpage', { state: { buggy } });
    };

    return (
        <div className="px-2 md:w-64 h-full lg:mb-2 mx-auto" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className="rounded-lg overflow-hidden shadow-lg h-full">
                <img src={imageUrl} alt={buggy.name} className="w-full h-40 object-cover" />
                <div className="p-4 bg-white">
                    <h3 className="text-lg font-bold">{buggy.name}</h3>
                    <div className="flex">
                        {buggy.ratings ? renderStars(buggy.ratings) : <span className="text-gray-500">No ratings yet</span>}
                    </div>
                    {buggy.companyName && (
                        <p className="text-gray-600 mt-2" style={{ textDecoration: 'underline' }}>
                            {buggy.companyName}
                        </p>
                    )}
                    <p className="text-gray-600">Distance: {buggy.distance} KM</p>
                    <div className="text-green-600 text-lg font-bold mt-2">
                        New Price: AED {buggy.lowestPriceOverallDetails.newPrice} <br /> <s>Old Price: AED {buggy.lowestPriceOverallDetails.oldPrice}</s>
                        <br /><span className="text-gray-500 text-sm ml-1">For Limited Time</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// CustomPrevArrow Component
const CustomPrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{
                ...style,
                left: '-50px', // Move arrow to the left of the slider
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "green",
                color: "white",
                borderRadius: "4px",
                padding: "15px 20px",
                cursor: "pointer"
            }}
            onClick={onClick}
        >
            <FaArrowLeft size={24} />
        </div>
    );
};

// CustomNextArrow Component
const CustomNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{
                ...style,
                right: '-50px', // Move arrow to the right of the slider
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "green",
                color: "white",
                borderRadius: "4px",
                padding: "15px 20px",
                cursor: "pointer"
            }}
            onClick={onClick}
        >
            <FaArrowRight size={24} />
        </div>
    );
};

const fetchCompanyDetails = async (companyUid) => {
    const companyRef = doc(db, 'Companies', companyUid);
    const companySnapshot = await getDoc(companyRef);

    if (companySnapshot.exists()) {
        const companyData = companySnapshot.data();
        return new CompanyModel(companyData);
    } else {
        return null;
    }
};


const _30MinsBuggies = () => {
    const [buggies, setBuggies] = useState([]);
    const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
    const sliderRef = useRef();
    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            position => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            err => {
                console.error('Error getting user location:', err);
                // Handle error or set default location
            }
        );
    }, []);

    useEffect(() => {
        setLoading(true); // Start loading

        if (userLocation.latitude && userLocation.longitude) {
            const fetchVehicles = async () => {
                const querySnapshot = await getDocs(collection(db, 'Buggies'));
                let fetchedBuggies = [];

                for (const doc of querySnapshot.docs) {
                    const buggyData = doc.data();
                    const buggy = new BuggyModel(buggyData, userLocation.latitude, userLocation.longitude);

                    if (buggy.isApproved && buggy.duration === "30 Minutes") {
                        const company = await fetchCompanyDetails(buggy.companyUid);
                        if (company) {
                            buggy.companyName = company.name; // Add the company name to the buggy object
                        }
                        fetchedBuggies.push(buggy);
                    }
                }

                setBuggies(fetchedBuggies);
                setLoading(false); // End loading
            };

            fetchVehicles();
        }
    }, [userLocation]);

    const sliderSettings = {
        dots: false,
        infinite: buggies.length > 2,
        prevArrow: <CustomPrevArrow />,
        nextArrow: <CustomNextArrow />,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1440,
                settings: {
                    slidesToShow: 2, // Show three cards on tablets
                    slidesToScroll: 2,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    // Conditionally render the component based on the buggies array
    if (buggies.length === 0) {
        return null; // This will hide the component completely when there are no buggies.
    }

    return (
        <div
            className="relative py-20"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="text-center mb-6">
                <span className="exclusive-offer-heading text-white">
                    Exclusive&#160;&#160;
                </span>
                <div className="inline-block bg-green-600 text-white py-2 px-4 rounded exclusive-offer-heading">
                    30 - Minutes Offers
                </div>
            </div>
            <div className="relative w-4/6 mx-auto">
                {loading ? (
                    // Render the shimmer while loading
                    <Shimmer />
                ) : (
                    // Render the slider when not loading
                    <Slider className='mt-14 mx-auto md:w-4/6' {...sliderSettings}>
                        {buggies.map(buggy => (
                            <BuggyCard key={buggy.id ? buggy.id.toString() : `buggy-${Math.random()}`} buggy={buggy} />
                        ))}
                    </Slider>

                )}
            </div>
        </div>
    );
};

export default _30MinsBuggies;
