import React from 'react';
import Header from '../../Components/header'; // Adjust the path as necessary
import SearchAndFeatures from './firstComp';
import VehicleListing from './secondComp';
// import PopularBuggiesSection from './thirdComp';
import _30MinsBuggies from './fourthComp'
import OneHourBuggies from './fifthComp';
import TwoHourBuggies from './sixthComp';
import BuggiesArticles from './seventhComp';
import Footer from '../../Components/footer'; // Adjust the path as necessary
const HomePage = () => {
    return (
        <div className=''>
            <Header />
            {/* Other components specific to the homepage will go here */}
            <main>
                <SearchAndFeatures />
                <VehicleListing />
                {/* <PopularBuggiesSection /> */}
                <_30MinsBuggies />
                <OneHourBuggies />
                <TwoHourBuggies />
                <BuggiesArticles />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
