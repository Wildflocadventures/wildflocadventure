
import React from "react";
import { Star, Shield, Zap, Clock, Award, Smile } from "lucide-react";

const Features = () => {
  const featuresList = [
    {
      icon: <Star className="h-8 w-8 mb-4 text-orange-500" />,
      title: "Premium Experience",
      description: "Enjoy top-notch services and experiences with our premium offerings."
    },
    {
      icon: <Shield className="h-8 w-8 mb-4 text-orange-500" />,
      title: "Safe & Secure",
      description: "Your safety is our priority with comprehensive security measures."
    },
    {
      icon: <Zap className="h-8 w-8 mb-4 text-orange-500" />,
      title: "Fast Service",
      description: "Quick response times and efficient service delivery guaranteed."
    },
    {
      icon: <Clock className="h-8 w-8 mb-4 text-orange-500" />,
      title: "24/7 Support",
      description: "Our dedicated support team is available round the clock."
    },
    {
      icon: <Award className="h-8 w-8 mb-4 text-orange-500" />,
      title: "Award Winning",
      description: "Recognized for excellence in service and customer satisfaction."
    },
    {
      icon: <Smile className="h-8 w-8 mb-4 text-orange-500" />,
      title: "Customer Satisfaction",
      description: "We strive to exceed expectations and ensure your happiness."
    }
  ];

  return (
    <div className="container mx-auto pt-24 px-4 pb-16">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Features</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuresList.map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="flex justify-center">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-700">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
