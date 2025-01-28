import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Edit2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

const CustomerBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [newDates, setNewDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        cars (
          model,
          rate_per_day,
          license_plate
        )
      `)
      .eq("customer_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your bookings",
        variant: "destructive",
      });
    } else {
      setBookings(data || []);
    }
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking || !newDates.from || !newDates.to) return;

    const totalDays = Math.ceil(
      (newDates.to.getTime() - newDates.from.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = totalDays * editingBooking.cars.rate_per_day;

    const { error } = await supabase
      .from("bookings")
      .update({
        start_date: newDates.from.toISOString(),
        end_date: newDates.to.toISOString(),
        total_amount: totalAmount
      })
      .eq('id', editingBooking.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
      fetchBookings();
      setEditingBooking(null);
      setNewDates({ from: undefined, to: undefined });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="container py-8 relative">
      <Button 
        variant="outline" 
        className="absolute top-4 right-4"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-4 border rounded relative">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setEditingBooking(booking);
                        setNewDates({
                          from: new Date(booking.start_date),
                          to: new Date(booking.end_date)
                        });
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Booking Dates</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Calendar
                        mode="range"
                        selected={{
                          from: newDates.from,
                          to: newDates.to,
                        }}
                        onSelect={(range) => {
                          setNewDates({
                            from: range?.from,
                            to: range?.to,
                          });
                        }}
                        numberOfMonths={2}
                      />
                      <Button 
                        onClick={handleUpdateBooking}
                        className="w-full"
                        disabled={!newDates.from || !newDates.to}
                      >
                        Update Booking
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <h3 className="font-medium">{booking.cars.model}</h3>
                <p className="text-sm text-gray-600">License: {booking.cars.license_plate}</p>
                <p className="text-sm text-gray-600">
                  Dates: {format(new Date(booking.start_date), "LLL dd, y")} - {format(new Date(booking.end_date), "LLL dd, y")}
                </p>
                <p className="text-sm text-gray-600">Total Amount: ${booking.total_amount}</p>
                <p className="text-sm text-gray-600">Status: {booking.status}</p>
              </div>
            ))}
            {bookings.length === 0 && (
              <p className="text-center text-gray-500">No bookings found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerBookings;