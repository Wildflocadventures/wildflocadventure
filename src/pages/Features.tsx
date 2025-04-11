
import React from "react";
import { Star, Shield, MapPin, CreditCard, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { useNavigate } from "react-router-dom";

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="backdrop-blur-xl bg-zinc-900/90 border border-zinc-800 rounded-lg p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-orange-500/20 rounded-full p-3">
          <Icon className="h-6 w-6 text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-gray-300">{description}</p>
    </div>
  );
};

const Features = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Star,
      title: "Premium Experiences",
      description: "We curate only the highest quality travel experiences, ensuring unforgettable memories."
    },
    {
      icon: Shield,
      title: "Secure Bookings",
      description: "Our secure payment system and booking protection guarantees peace of mind."
    },
    {
      icon: MapPin,
      title: "Exclusive Locations",
      description: "Access hidden gems and exclusive destinations not available through regular travel channels."
    },
    {
      icon: CreditCard,
      title: "Flexible Payment",
      description: "Choose from multiple payment options and enjoy flexible cancellation policies."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Our dedicated support team is always available to assist you throughout your journey."
    },
    {
      icon: Users,
      title: "Personalized Service",
      description: "Tailored travel plans that match your preferences and exceed your expectations."
    }
  ];

  return (
    <PageLayout>
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-orange-500">Our Features</h1>
            <p className="text-lg text-gray-300">
              Discover what makes WILDFLOC the premier choice for adventure seekers and luxury travelers alike. 
              We combine cutting-edge technology with personalized service to create unforgettable experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
          
          <div className="backdrop-blur-xl bg-zinc-900/90 border border-zinc-800 rounded-lg p-8 shadow-xl max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4 text-white">Ready to Experience the Difference?</h2>
              <p className="text-gray-300 mb-8">
                Join thousands of satisfied travelers who have discovered the WILDFLOC difference. 
                Start your adventure today and see why we're the trusted choice for discerning travelers.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white py-6 px-8 text-lg"
                  onClick={() => navigate('/activities')}
                >
                  Explore Activities
                </Button>
                <Button 
                  className="bg-zinc-800 hover:bg-zinc-700 text-white py-6 px-8 text-lg border border-zinc-700"
                  onClick={() => navigate('/contact')}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Features;
