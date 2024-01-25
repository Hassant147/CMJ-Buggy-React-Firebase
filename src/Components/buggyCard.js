import React from 'react';

const BuggyCard = ({ buggy }) => {
    const ratingStars = buggy.rating ? [...Array(Math.floor(buggy.rating))] : [];
    return (
        <div className="px-4">
            <div className="rounded-lg overflow-hidden shadow-lg">
                <img src={buggy.image} alt={buggy.name} className="w-full h-auto object-cover" />
                <div className="p-4 bg-white">
                    <h3 className="text-lg font-bold">{buggy.name}</h3>
                    <div className="flex items-center">
                        {ratingStars.map((_, index) => (
                            <span key={index} className="text-yellow-400">★</span>
                        ))}
                        <span className="text-gray-600 ml-2">{buggy.reviewCount} Ratings</span>
                    </div>
                    <p className="text-gray-600">{buggy.distance}</p>
                    <p className="text-gray-600">{buggy.provider}</p>
                    <div className="text-green-600 text-lg font-bold mt-2">
                        {buggy.price}
                        <span className="text-gray-500 text-sm ml-1">For Limited Time</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuggyCard;
