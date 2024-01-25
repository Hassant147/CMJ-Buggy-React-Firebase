import React from 'react';
import './Shimmer.css'; // Make sure to import the CSS file

const Shimmer = () => {
    return (
        <div className="shimmer-wrapper">
            {/* Repeat the shimmer-card for as many cards as you want to display */}
            <div className="shimmer-card">
                <div className="shimmer-image"></div>
                <div className="shimmer-text-line shimmer-title"></div>
                <div className="shimmer-text-line shimmer-rating"></div>
                <div className="shimmer-text-line shimmer-distance"></div>
                <div className="shimmer-price-container">
                    <div className="shimmer-text-line shimmer-price"></div>
                    <div className="shimmer-text-line shimmer-old-price"></div>
                </div>
            </div>
        </div>
    );
};

export default Shimmer;
