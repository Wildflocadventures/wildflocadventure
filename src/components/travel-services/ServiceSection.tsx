
import React from "react";
import { ServiceCard } from "./ServiceCard";

export const ServiceSection: React.FC = () => {
  const services = [
    {
      title: "Things to do in Kashmir",
      description: "Explore exciting activities and adventures in Kashmir",
      imageUrl: "/public/Kashmir.jpg",
      linkTo: "/activities",
      overlayText: {
        title: "KASHMIR",
        subtitle: "PLACES TO VISIT, THINGS TO DO & TRAVEL GUIDE"
      }
    },
    {
      title: "Car Rentals",
      description: "Find the perfect vehicle for your Kashmir journey",
      imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      linkTo: "/car-rentals"
    },
    {
      title: "Tours",
      description: "Discover guided tours and travel packages",
      imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      linkTo: "/activities"
    }
  ];

  return (
    <div className="bg-black py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-orange-500 text-center mb-16">Our Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              imageUrl={service.imageUrl}
              linkTo={service.linkTo}
              overlayText={service.overlayText}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
