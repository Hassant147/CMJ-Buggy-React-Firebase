import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Adjust the import path as necessary
import Logo from './headerMedia/Frame 9.png'; // Adjust the path as necessary
import PhoneNum from './headerMedia/Frame 10.png'; // Adjust the path as necessary
import Email from './headerMedia/Frame 11.png'; // Adjust the path as necessary
import Address from './headerMedia/Frame 12.png'; // Adjust the path as necessary

const Header = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navigate = useNavigate(); // Hook to navigate user after logout
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

    const logout = () => {
        auth.signOut()
            .then(() => {
                // Redirect to login or home page after successful logout
                navigate('/login'); // Replace '/login' with the path to your login or home page
            })
            .catch((error) => {
                // Handle any errors during logout
                console.error('Logout error:', error);
            });
    };
    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return (
        <>
            {/* Part 1: Top Bar */}
            <div className="bg-white text-black flex justify-between items-center px-4 py-4 lg:px-20 lg:pb-16 lg:pt-5">
                <div className="flex lg:ml-40">
                    {/* Logo */}
                    <img src={Logo} alt="Logo" className="h-16" />
                </div>
                <div className="hidden lg:flex items-center space-x-10">
                    <span><img src={PhoneNum} alt="Phone" style={{ display: 'inline-block', marginRight: '8px' }} />+000 (123) 456 88</span>
                    <span><img src={Email} alt="Email" style={{ display: 'inline-block', marginRight: '8px' }} />contact@example.com</span>
                    <span><img src={Address} alt="Address" style={{ display: 'inline-block', marginRight: '8px' }} />543 Main Street, Dubai. UAE</span>
                </div>

                {/* Dropdown Button */}
                <button
                    className="lg:hidden flex flex-col space-y-1 p-2"
                    onClick={() => setIsNavOpen((prev) => !prev)}
                >
                    <span className="block w-8 h-0.5 bg-black"></span>
                    <span className="block w-8 h-0.5 bg-black"></span>
                    <span className="block w-8 h-0.5 bg-black"></span>
                </button>
            </div>
            {/* Part 2: Navigation Bar */}
            <div className={`py-4 bg-black ${isNavOpen ? 'block' : 'hidden'} lg:flex lg:items-center lg:justify-center lg:w-3/4 lg:mx-auto lg:rounded-lg lg:-top-10 `} style={isLargeScreen ?
                { position: 'relative', top: 'HEIGHT_OF_TOP_BAR', zIndex: 1000 } :
                { position: 'absolute', top: '13.5%', zIndex: 1000, width: '100%' }}>
                <nav className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 lg:py-0">
                    <Link to="/homepage" className="text-white hover:bg-gray-700 px-3 py-2 rounded text-center">Home</Link>
                    <Link to="/about" className="text-white hover:bg-gray-700 px-3 py-2 rounded text-center">About</Link>
                    <Link to="/services" className="text-white hover:bg-gray-700 px-3 py-2 rounded text-center">Services</Link>
                    <Link to="/blogs" className="text-white hover:bg-gray-700 px-3 py-2 rounded text-center">Blogs</Link>
                    <Link to="/contact" className="text-white hover:bg-gray-700 px-3 py-2 rounded text-center">Contact Us</Link>
                    <button onClick={logout} className="text-white hover:bg-gray-700 px-3 py-2 rounded text-center">Logout</button>
                </nav>
            </div>
        </>
    );
};

export default Header;
