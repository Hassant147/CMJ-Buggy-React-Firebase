import React from 'react';

const LoadingIndicator = () => {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Processing your payment...</p>
        </div>
    );
};

export default LoadingIndicator;
