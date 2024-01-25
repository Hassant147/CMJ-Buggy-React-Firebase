import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import HeroImage from './firstCompMedia/bg.png';

// Dummy data for articles
const articles = [
    {
        id: 1,
        title: "The top 10 Buggies Worldwide",
        date: "09 November, 2023",
        imageUrl: HeroImage, // Replace with your image path
    }, {
        id: 1,
        title: "The top 10 Buggies Worldwide",
        date: "09 November, 2023",
        imageUrl: HeroImage, // Replace with your image path
    }, {
        id: 1,
        title: "The top 10 Buggies Worldwide",
        date: "09 November, 2023",
        imageUrl: HeroImage, // Replace with your image path
    }, {
        id: 1,
        title: "The top 10 Buggies Worldwide",
        date: "09 November, 2023",
        imageUrl: HeroImage, // Replace with your image path
    },
];


// Slider settings
const sliderSettings = {
    dots: false,
    infinite: articles.length > 2,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
            },
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
            },
        },
    ],
};

const BuggyCard = ({ article, index }) => {
    const { imageUrl, title, date } = article;

    const cardStyle = {
        width: 'auto',
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        height: '300px', // Set a fixed height or as needed
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end', // Position text at the bottom
        padding: '0px',
        color: 'white',
        opacity: 0.8, // Set the desired opacity
    };
    // Add padding to create space around the card for spacing
    const containerStyle = {
        paddingRight: '30px', // This will create space on the sides of the card
        ...(index === 0 && { paddingLeft: '0' }), // Remove left padding if it's the first card
        ...(index === articles.length - 1 && { paddingRight: '0' }), // Remove right padding if it's the last card
    };

    return (
        <div style={containerStyle}>
            <div className="rounded-lg overflow-hidden shadow-lg" style={cardStyle}>
                <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p>{date}</p>
                </div>
            </div>
        </div>
    );
};


const BuggiesArticlesSlider = () => {
    return (
        <div className="py-12 mx-auto " style={{ width: '65%' }}>
            <h2 className="text-2xl font-bold text-left mb-8">Buggies Articles</h2>
            <Slider {...sliderSettings}>
                {articles.map((article, index) => (
                    <BuggyCard key={index} article={article} />
                ))}
            </Slider>
        </div>
    );
};

export default BuggiesArticlesSlider;