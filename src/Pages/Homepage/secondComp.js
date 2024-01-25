import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust this import path to your firebase configuration file
import BuggyModel from '../../Models/buggyModel'; // Adjust this import path to your BuggyModel file
import CompanyModel from '../../Models/CompanyModel'; // Adjust this import path to your CompanyModel file
import Shimmer from '../../Components/Shimmer/Shimmer';

// Import the CSS for the carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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
        <div className="px-2 md:w-64 lg:mb-2 mx-auto h-full flex flex-col" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className="rounded-lg overflow-hidden shadow-lg flex flex-col h-full">
                <img src={imageUrl} alt={buggy.name} className="w-full h-40 object-cover" />
                <div className="p-4 bg-white flex-grow">
                    <h3 className="text-lg font-bold truncate">{buggy.name}</h3>
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


// VehicleSelector Component
const VehicleSelector = () => {
    // Define states
    const [vehicles, setVehicles] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [selectedCapacity, setSelectedCapacity] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    // States for types and seats
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [seatingCapacities, setSeatingCapacities] = useState([]);

    // Fetch types and seats from Firebase
    const fetchTypesAndSeats = async () => {
        const querySnapshot = await getDocs(collection(db, 'Types'));
        let fetchedTypes = [];
        let fetchedSeats = [];
        querySnapshot.forEach((doc) => {
            fetchedTypes.push(doc.data().Name);
            fetchedSeats = [...fetchedSeats, ...doc.data()['Seat Names']];
        });

        // Set the types and seats
        setVehicleTypes(fetchedTypes);
        setSeatingCapacities([...new Set(fetchedSeats)]); // Remove duplicates

        // Set default selections
        if (fetchedTypes.length > 0) {
            setSelectedType(fetchedTypes[0]);
        }
        if (fetchedSeats.length > 0) {
            setSelectedCapacity(fetchedSeats[0]);
        }
    };

    useEffect(() => {
        fetchTypesAndSeats();
    }, []);

    const settings = {
        infinite: vehicles.length > 3,
        dots: vehicles.length > 3,
        speed: 500,
        prevArrow: <CustomPrevArrow />,
        nextArrow: <CustomNextArrow />,
        slidesToShow: 3, // Show only three cards on desktop
        slidesToScroll: 3, // Scroll three cards at a time on desktop
        responsive: [
            {
                breakpoint: 1440,
                settings: {
                    slidesToShow: 2, // Show three cards on tablets
                    slidesToScroll: 2,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1, // Show one card on mobile devices
                    slidesToScroll: 1,
                }
            }
        ],
    };


    useEffect(() => {
        // Fetch user's location first
        navigator.geolocation.getCurrentPosition(
            position => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            error => {
                console.error("Error getting the location", error);
            }
        );
    }, []);

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true); // Start loading
            if (userLocation && userLocation.latitude && userLocation.longitude) {
                const querySnapshot = await getDocs(collection(db, 'Buggies'));
                let fetchedVehicles = [];
                for (const doc of querySnapshot.docs) {
                    const buggy = new BuggyModel({ ...doc.data(), id: doc.id }, userLocation.latitude, userLocation.longitude);
                    if (buggy.isApproved && buggy.type === selectedType && buggy.seats === selectedCapacity) {
                        const company = await fetchCompanyDetails(buggy.companyUid);
                        if (company) {
                            buggy.companyName = company.name;
                        }
                        fetchedVehicles.push(buggy);
                    }
                }

                setVehicles(fetchedVehicles);
                setLoading(false);
            }
        };

        fetchVehicles();
    }, [userLocation, selectedType, selectedCapacity]);

    return (
        <section className='bg-green-50'>
            <div className="p-4 w-4/5 mx-auto md:pb-20 md:pt-20 pt-14 pb-14">
                {/* Vehicle Type Filters */}
                <div className="bg-white p-2 rounded-lg shadow mb-4 mx-auto lg:w-max overflow-auto">
                    <div className="flex justify-center flex-nowrap">
                        {vehicleTypes.map(type => (
                            <button
                                key={type}
                                className={`mx-2 my-1 px-4 md:px-8 lg:px-16 py-2 rounded-lg ${selectedType === type ? 'bg-custom-green text-white' : 'text-black'}`}
                                onClick={() => setSelectedType(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Seating Capacity Filters */}
                <div className="bg-white p-2 rounded-lg shadow mb-4 mx-auto lg:w-max overflow-auto">
                    <div className="flex justify-center flex-nowrap">
                        {seatingCapacities.map(capacity => (
                            <button
                                key={capacity}
                                className={`mx-2 my-1 px-4 md:px-8 lg:px-16 py-2 rounded-lg ${selectedCapacity === capacity ? 'bg-custom-green text-white' : 'text-black'}`}
                                onClick={() => setSelectedCapacity(capacity)}
                            >
                                {capacity}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    // Render the shimmer while loading
                    <Shimmer />
                ) : (
                    // Render the slider when not loading
                    <Slider className='mt-14 mx-auto md:w-4/6 w-11/12'
                        {...settings}>
                        {vehicles.map(buggy => (
                            <BuggyCard key={buggy.id} buggy={buggy} />
                        ))}
                    </Slider>
                )}
            </div>
        </section>

    );
};

export default VehicleSelector;
