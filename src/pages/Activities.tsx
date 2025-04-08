
import React from "react";

const Activities = () => {
  return (
    <div className="container mx-auto pt-24 px-4">
      <h1 className="text-4xl font-bold mb-8">Our Activities</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Activity Cards */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Activity {item}</h3>
              <p className="text-gray-700 mb-4">
                Experience the thrill and adventure with our carefully curated activities
                designed for all skill levels and preferences.
              </p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;
