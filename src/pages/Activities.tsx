
import React, { useState } from "react";
import { Plane, Navigation, Scissors, Car, Waves, Brush, Mountain, Factory, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const ActivityCard = ({ 
  title, 
  description, 
  price, 
  icon: Icon,
  imageUrl,
  id
}: { 
  title: string; 
  description: string; 
  price: string;
  icon: React.ElementType;
  imageUrl: string;
  id: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="bg-black/95 rounded-lg overflow-hidden shadow-xl">
      <div className="h-48 relative">
        {isLoading && (
          <Skeleton className="w-full h-full absolute inset-0 bg-gray-800" />
        )}
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover" 
          onLoad={() => setIsLoading(false)}
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      </div>
      <div className="p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="text-orange-500" size={18} />
          <h3 className="text-xl font-bold text-orange-500">{title}</h3>
        </div>
        <p className="text-gray-300 mb-4 text-sm">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-white">₹{price}</span>
          <Link to={`/activity/${id}`}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Know More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Activities = () => {
  const activities = [
    {
      id: "chopper-ride",
      title: "Chopper Ride",
      description: "Experience the thrill of a chopper ride over the city.",
      price: "29,900",
      icon: Plane,
      imageUrl: "https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&q=80&w=800&h=450"
    },
    {
      id: "shikara-ride",
      title: "Shikara Ride",
      description: "Enjoy a peaceful ride on a traditional Shikara.",
      price: "19,900",
      icon: Navigation,
      imageUrl: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=800&h=450"
    },
    {
      id: "pashmina-factory-tour",
      title: "Pashmina Factory Tour",
      description: "Discover the art of Pashmina making.",
      price: "9,900",
      icon: Scissors,
      imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=800&h=450"
    },
    {
      id: "offroad-adventure",
      title: "Offroad Adventure",
      description: "Experience the thrill of off-road driving through rugged trails.",
      price: "49,900",
      icon: Car,
      imageUrl: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&q=80&w=800&h=450"
    },
    {
      id: "rafting",
      title: "Rafting",
      description: "Enjoy an exhilarating rafting experience.",
      price: "39,900",
      icon: Waves,
      imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800&h=450"
    },
    {
      id: "handicraft-factory-tour",
      title: "Handicraft Factory Tour",
      description: "Explore the traditional handicraft making process.",
      price: "14,900",
      icon: Brush,
      imageUrl: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=800&h=450"
    },
    {
      id: "paragliding",
      title: "Paragliding",
      description: "Soar through the skies with a paragliding adventure.",
      price: "34,900",
      icon: Mountain,
      imageUrl: "/lovable-uploads/2ef6f7f0-2444-4af8-a447-f4241a2433cb.png"
    },
    {
      id: "bat-factory-tour",
      title: "Bat Factory Tour",
      description: "Visit a factory where cricket bats are made.",
      price: "12,900",
      icon: Factory,
      imageUrl: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&q=80&w=800&h=450"
    },
    {
      id: "hiking",
      title: "Hiking with Kids and Family",
      description: "Enjoy a family-friendly hiking experience.",
      price: "19,900",
      icon: Users,
      imageUrl: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=800&h=450"
    },
  ];

  return (
    <div className="bg-black min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto">
        <h1 className="text-5xl font-bold mb-2 text-center text-orange-500">Available Activities</h1>
        <p className="text-white text-center mb-12">Discover exciting adventures and experiences in Kashmir</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, index) => (
            <ActivityCard key={index} {...activity} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activities;
