
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceCardProps {
  title: string;
  description: string;
  imageUrl: string;
  linkTo: string;
  overlayText?: {
    title: string;
    subtitle?: string;
  };
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  imageUrl,
  linkTo,
  overlayText,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-black/95 rounded-lg overflow-hidden shadow-xl h-full flex flex-col">
      <div className="relative h-64">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {overlayText && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <div>
              <h3 className="text-4xl font-bold text-white uppercase tracking-wider">
                {overlayText.title}
              </h3>
              {overlayText.subtitle && (
                <p className="text-sm font-medium text-white mt-2 uppercase tracking-wide">
                  {overlayText.subtitle}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-orange-500 mb-2">{title}</h3>
        <p className="text-gray-300 mb-6 flex-grow">{description}</p>
        <Button 
          onClick={() => navigate(linkTo)} 
          variant="link" 
          className="text-orange-500 p-0 flex items-center self-start hover:text-orange-400"
        >
          Learn More <ArrowRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
