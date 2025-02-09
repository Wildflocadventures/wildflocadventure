
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

const ProviderBookings = () => {
  const { session } = useAuthProfile();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["provider-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          cars (
            model,
            license_plate
          ),
          customer_details (
            full_name,
            phone,
            email
          )
        `)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Cars' Bookings</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Car</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings?.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {booking.cars?.model} ({booking.cars?.license_plate})
                </TableCell>
                <TableCell>{booking.customer_details?.full_name}</TableCell>
                <TableCell>
                  {booking.customer_details?.phone}
                  <br />
                  {booking.customer_details?.email}
                </TableCell>
                <TableCell>
                  {format(new Date(booking.start_date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(booking.end_date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>${booking.total_amount}</TableCell>
                <TableCell>
                  <span className="capitalize">{booking.status}</span>
                </TableCell>
              </TableRow>
            ))}
            {bookings?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProviderBookings;
