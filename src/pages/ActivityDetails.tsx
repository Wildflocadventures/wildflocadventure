
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Navigation, Scissors, Car, Waves, Brush, Mountain, Factory, Users, Mail, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

// Map to store all activities data
const activitiesData = [
  {
    id: "chopper-ride",
    title: "Chopper Ride",
    description: "Experience the thrill of a chopper ride over the city.",
    longDescription: "Take to the skies with our exclusive chopper ride experience over Kashmir. Enjoy breathtaking aerial views of the Dal Lake, Mughal Gardens, and the majestic Himalayan ranges. This 30-minute adventure gives you a unique perspective of Kashmir's paradise-like landscape from above. Our experienced pilots ensure a safe and memorable journey through the clouds.",
    price: "29,900",
    icon: Plane,
    imageUrl: "https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&q=80&w=800&h=450",
    duration: "30 minutes",
    includes: ["Professional pilot", "Safety briefing", "Photography opportunities", "Hotel pickup and drop-off"],
    highlights: ["Aerial views of Dal Lake", "Panoramic mountain views", "Unique photo opportunities"]
  },
  {
    id: "shikara-ride",
    title: "Shikara Ride",
    description: "Enjoy a peaceful ride on a traditional Shikara.",
    longDescription: "Glide peacefully through the iconic Dal Lake on a traditional Kashmiri Shikara boat. This quintessential Kashmir experience takes you through floating gardens, markets, and past historic houseboats. Our professionally trained Shikara oarsmen will guide you through the lake while sharing stories and pointing out significant landmarks.",
    price: "19,900",
    icon: Navigation,
    imageUrl: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=800&h=450",
    duration: "2 hours",
    includes: ["Professional Shikara oarsman", "Refreshments", "Photo stops"],
    highlights: ["Floating gardens", "Local market visit", "Sunset views over the lake"]
  },
  {
    id: "pashmina-factory-tour",
    title: "Pashmina Factory Tour",
    description: "Discover the art of Pashmina making.",
    longDescription: "Discover the centuries-old craft of creating the world-famous Kashmiri Pashmina. Visit a traditional factory to witness the intricate process from raw wool to the finished product. Learn about the artisans who dedicate their lives to this heritage craft, and get a chance to purchase authentic Pashmina directly from the source.",
    price: "9,900",
    icon: Scissors,
    imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=800&h=450",
    duration: "3 hours",
    includes: ["Expert guide", "Factory tour", "Pashmina demonstration", "Shopping opportunity"],
    highlights: ["Traditional weaving techniques", "Meeting skilled artisans", "Cultural insights"]
  },
  {
    id: "offroad-adventure",
    title: "Offroad Adventure",
    description: "Experience the thrill of off-road driving through rugged trails.",
    longDescription: "Experience an adrenaline-pumping off-road adventure through Kashmir's rugged terrain. Drive specially equipped 4x4 vehicles through challenging mountain trails, river crossings, and steep inclines. Our experienced guides ensure your safety while leading you to hidden viewpoints and pristine locations inaccessible by regular vehicles.",
    price: "49,900",
    icon: Car,
    imageUrl: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&q=80&w=800&h=450",
    duration: "Full day",
    includes: ["4x4 vehicle rental", "Experienced guide", "Lunch and refreshments", "Safety equipment"],
    highlights: ["Remote mountain trails", "River crossings", "Hidden viewpoints", "Exclusive locations"]
  },
  {
    id: "rafting",
    title: "Rafting",
    description: "Enjoy an exhilarating rafting experience.",
    longDescription: "Feel the rush as you navigate the white waters of Kashmir's mountain rivers. This rafting adventure offers various difficulty levels suitable for beginners to experienced rafters. With qualified instructors and top-quality equipment, you'll enjoy a safe yet thrilling experience through spectacular river gorges and amid breathtaking natural scenery.",
    price: "39,900",
    icon: Waves,
    imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800&h=450",
    duration: "3-4 hours",
    includes: ["Professional guides", "Safety equipment", "Training session", "Transportation to/from rafting point"],
    highlights: ["Multiple rapid sections", "Stunning gorge scenery", "Team building experience"]
  },
  {
    id: "handicraft-factory-tour",
    title: "Handicraft Factory Tour",
    description: "Explore the traditional handicraft making process.",
    longDescription: "Immerse yourself in Kashmir's rich artistic heritage with a guided tour of a traditional handicraft factory. Watch skilled craftsmen create intricate carpets, wood carvings, and paper-mâché items using techniques passed down through generations. This cultural experience provides insight into Kashmir's artistic traditions and the chance to acquire authentic handcrafted souvenirs.",
    price: "14,900",
    icon: Brush,
    imageUrl: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&q=80&w=800&h=450",
    duration: "4 hours",
    includes: ["Expert cultural guide", "Factory visits", "Artisan demonstrations", "Shopping opportunity"],
    highlights: ["Traditional craft demonstrations", "Historical context", "Direct interaction with artisans"]
  },
  {
    id: "paragliding",
    title: "Paragliding",
    description: "Soar through the skies with a paragliding adventure.",
    longDescription: "Experience the ultimate freedom of flight with our paragliding adventure over Kashmir's stunning landscape. Take off from mountain launch points and soar like a bird above lush valleys, mountains, and lakes. Tandem flights with certified instructors ensure a safe yet exhilarating experience suitable for beginners, with no prior experience necessary.",
    price: "34,900",
    icon: Mountain,
    imageUrl: "/lovable-uploads/2ef6f7f0-2444-4af8-a447-f4241a2433cb.png",
    duration: "1-2 hours",
    includes: ["Professional pilot", "All necessary equipment", "Safety briefing", "Transportation to launch site"],
    highlights: ["Bird's eye views", "Free-flying sensation", "Unique perspective of Kashmir valley"]
  },
  {
    id: "bat-factory-tour",
    title: "Bat Factory Tour",
    description: "Visit a factory where cricket bats are made.",
    longDescription: "Discover the craftsmanship behind Kashmir's famous cricket bats on this specialized factory tour. Watch skilled woodworkers transform raw willow wood into professional-grade cricket bats used by players worldwide. Learn about the unique properties of Kashmiri willow, the manufacturing process, and the global reputation of these locally crafted sporting goods.",
    price: "12,900",
    icon: Factory,
    imageUrl: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&q=80&w=800&h=450",
    duration: "2 hours",
    includes: ["Factory tour", "Expert guide", "Bat making demonstration"],
    highlights: ["Full manufacturing process", "Unique Kashmir willow insight", "Cricket history in Kashmir"]
  },
  {
    id: "hiking",
    title: "Hiking with Kids and Family",
    description: "Enjoy a family-friendly hiking experience.",
    longDescription: "Embark on a specially designed family hiking adventure through Kashmir's gentle trails and meadows. These routes are selected for their ease and interest points, making them perfect for children and adults alike. Along the way, your guide will point out local flora and fauna, share stories, and ensure a comfortable pace suitable for all ages.",
    price: "19,900",
    icon: Users,
    imageUrl: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=800&h=450",
    duration: "Half day",
    includes: ["Family-friendly guide", "Light refreshments", "First aid kit", "Nature activities"],
    highlights: ["Easy terrain", "Educational elements", "Wildlife spotting", "Family bonding"]
  }
];

const ActivityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<any>(null);
  
  useEffect(() => {
    // Find the activity with matching id
    const foundActivity = activitiesData.find(act => act.id === id);
    if (foundActivity) {
      setActivity(foundActivity);
    }
  }, [id]);

  const handleEnquiry = () => {
    toast.success("Your enquiry has been submitted. We'll contact you soon!");
  };
  
  const handleBooking = () => {
    toast.success("Booking request received. Our team will reach out to you shortly!");
  };

  if (!activity) {
    return (
      <div className="bg-black min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto text-center text-white">
          <h1 className="text-3xl">Activity not found</h1>
          <Link to="/activities">
            <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
              Back to Activities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = activity.icon;

  return (
    <div className="bg-black min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Link to="/activities">
            <Button variant="outline" className="text-white border-white hover:bg-orange-900/20">
              ← Back to Activities
            </Button>
          </Link>
        </div>
        
        {/* Activity header */}
        <div className="flex items-center gap-3 mb-6">
          <Icon size={32} className="text-orange-500" />
          <h1 className="text-4xl md:text-5xl font-bold text-orange-500">{activity.title}</h1>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Image */}
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden mb-8">
              <img 
                src={activity.imageUrl} 
                alt={activity.title} 
                className="w-full h-[400px] object-cover"
              />
            </div>
            
            {/* Description */}
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-orange-500 mb-4">Description</h2>
                <p className="text-gray-300 mb-6">{activity.longDescription}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Includes */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Includes</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      {activity.includes.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Highlights */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Highlights</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      {activity.highlights.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Booking info */}
          <div>
            <Card className="bg-zinc-900 border-zinc-800 text-white sticky top-24">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h3 className="text-lg text-gray-300 mb-1">Price</h3>
                  <p className="text-3xl font-bold text-orange-500">₹{activity.price}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg text-gray-300 mb-1">Duration</h3>
                  <p className="text-xl font-medium">{activity.duration}</p>
                </div>
                
                {/* Buttons */}
                <div className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-6">
                        <Mail className="mr-2 h-5 w-5" />
                        Enquire Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-orange-500 text-2xl">Enquire About {activity.title}</DialogTitle>
                        <DialogDescription className="text-gray-300">
                          Fill in your details and we'll get back to you with more information.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <p className="text-white">This is a demo form. In a real application, this would contain form fields to collect user information.</p>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          className="bg-orange-500 hover:bg-orange-600" 
                          onClick={handleEnquiry}
                        >
                          Submit Enquiry
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                        <Calendar className="mr-2 h-5 w-5" />
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-green-500 text-2xl">Book {activity.title}</DialogTitle>
                        <DialogDescription className="text-gray-300">
                          Complete your booking by providing the following information.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <p className="text-white">This is a demo form. In a real application, this would contain booking form fields with date selection, number of participants, etc.</p>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          className="bg-green-600 hover:bg-green-700" 
                          onClick={handleBooking}
                        >
                          Confirm Booking
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
