import React from 'react';
import { useLocation } from 'react-router-dom';

import Header from '../../Components/header'; // Adjust the path as necessary
import Footer from '../../Components/footer'; // Adjust the path as necessary
import FirstComponent from './firstComp';

const BookingPage = () => {
    const location = useLocation();
    const buggy = location.state?.buggy; // Use optional chaining

    // Check if the buggy data is available
    if (!buggy) {
        return <div>No buggy selected.</div>;
    }

    return (
        <div>
            <Header />
            <main className='w-4/6 mx-auto'>
                <FirstComponent buggy={buggy} />
            </main>
            <Footer />
        </div>
    );
};

export default BookingPage;
