
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { ProviderBookings } from "@/components/provider/ProviderBookings";
import { CarForm } from "@/components/provider/CarForm";
import { UnavailabilityForm } from "@/components/provider/UnavailabilityForm";
import { CarsList } from "@/components/provider/CarsList";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { userProfile, providerCars, refreshProviderData, isLoading } = useAuthProfile();
  const [editingCar, setEditingCar] = useState<any>(null);

  useEffect(() => {
    if (!userProfile || userProfile.role !== 'provider') {
      navigate('/provider/auth');
    }
  }, [userProfile, navigate]);

  // Load provider data when component mounts
  useEffect(() => {
    if (userProfile && userProfile.role === 'provider') {
      refreshProviderData();
    }
  }, [userProfile, refreshProviderData]);

  useEffect(() => {
    console.log("Provider cars updated:", providerCars);
  }, [providerCars]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Provider Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            onClick={refreshProviderData}
            className="flex items-center gap-2"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
          <Button 
            onClick={() => navigate('/provider/bookings')}
            className="flex items-center gap-2"
            variant="outline"
          >
            <CalendarIcon className="w-4 h-4" />
            View All Bookings
          </Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {userProfile && (
          <CarForm 
            userProfileId={userProfile.id} 
            editingCar={editingCar} 
            setEditingCar={setEditingCar} 
            refreshProviderData={refreshProviderData} 
          />
        )}

        <div className="space-y-8">
          <UnavailabilityForm 
            providerCars={providerCars} 
            refreshProviderData={refreshProviderData} 
          />
          
          <ProviderBookings />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Cars</h2>
        <CarsList 
          cars={providerCars} 
          setEditingCar={setEditingCar} 
          refreshProviderData={refreshProviderData}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ProviderDashboard;
