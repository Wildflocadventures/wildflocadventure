
import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";

const About = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-8 text-center text-orange-500">About Us</h1>
        
        <div className="max-w-3xl mx-auto backdrop-blur-xl bg-zinc-900/90 border border-zinc-800 p-8 rounded-lg shadow-2xl">
          <p className="text-lg mb-6 text-gray-300">
            Welcome to WILDFLOC, where adventure meets luxury. Our mission is to provide exceptional travel experiences that create lifelong memories.
          </p>
          
          <p className="text-lg mb-6 text-gray-300">
            Founded in 2020, we've quickly grown to become a leading provider of premium travel services, known for our attention to detail and customer-centric approach.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-500">Our Story</h2>
          <p className="text-lg mb-6 text-gray-300">
            WILDFLOC was born from a passion for exploration and a desire to share the world's wonders with like-minded adventurers. What started as a small team of travel enthusiasts has evolved into a comprehensive travel platform serving thousands of satisfied customers.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-500">Our Values</h2>
          <ul className="list-disc pl-6 text-lg mb-6 text-gray-300">
            <li className="mb-2">Excellence in every aspect of our service</li>
            <li className="mb-2">Sustainability and respect for the environment</li>
            <li className="mb-2">Authentic and immersive travel experiences</li>
            <li className="mb-2">Safety and security for all our customers</li>
            <li className="mb-2">Innovation in travel solutions</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-orange-500">Meet The Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="text-center">
                <div className="h-32 w-32 bg-zinc-800 rounded-full mx-auto mb-4 border border-zinc-700"></div>
                <h3 className="font-bold text-lg text-white">Team Member {item}</h3>
                <p className="text-gray-400">Position</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default About;
