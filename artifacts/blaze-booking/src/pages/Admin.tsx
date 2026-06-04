import { useEffect, useState } from "react";
import { useListReservations, useGetReservationStats, useUpdateReservationStatus, getListReservationsQueryKey, getGetReservationStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, Users, Car, Check, X, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Re-using Shadcn components for table since standard table is complex, using raw HTML for simplicity
// Will replace with standard HTML table inside a card for admin view

export default function Admin() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats } = useGetReservationStats({ query: { queryKey: getGetReservationStatsQueryKey() } });
  
  const params = filterStatus !== "all" ? { status: filterStatus as any } : undefined;
  const { data: reservations, isLoading } = useListReservations(params, { 
    query: { queryKey: getListReservationsQueryKey(params) } 
  });

  const updateStatus = useUpdateReservationStatus();

  useEffect(() => {
    document.title = "Admin Dashboard - Blaze Car Services";
  }, []);

  const handleUpdateStatus = (id: number, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListReservationsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReservationStatsQueryKey() });
          toast({
            title: "Status Updated",
            description: `Reservation #${id} is now ${status}.`,
          });
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pending</Badge>;
      case 'confirmed': return <Badge variant="outline" className="bg-primary/10 text-primary hover:bg-primary/20">Confirmed</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>;
      case 'cancelled': return <Badge variant="outline" className="bg-destructive/10 text-destructive hover:bg-destructive/20">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 container max-w-screen-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage reservations and view business metrics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.pending || 0} pending action
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vehicle Split</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xl font-bold">{stats?.sedanBookings || 0}</div>
                <p className="text-xs text-muted-foreground">Sedans</p>
              </div>
              <div>
                <div className="text-xl font-bold">{stats?.suvBookings || 0}</div>
                <p className="text-xs text-muted-foreground">SUVs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Service Types</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <span className="text-lg font-bold">{stats?.airportTransfers || 0}</span>
                <span className="text-xs text-muted-foreground ml-1">Airports</span>
              </div>
              <div>
                <span className="text-lg font-bold">{stats?.corporateBookings || 0}</span>
                <span className="text-xs text-muted-foreground ml-1">Corp</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservations List */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/30">
          <div>
            <CardTitle>Recent Reservations</CardTitle>
          </div>
          <div className="w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">ID & Date</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8">Loading reservations...</td></tr>
                ) : reservations?.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No reservations found.</td></tr>
                ) : (
                  reservations?.map((res) => (
                    <tr key={res.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">#{res.id.toString().padStart(5, '0')}</div>
                        <div className="text-muted-foreground text-xs">{new Date(res.pickupDate).toLocaleDateString()} {res.pickupTime}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{res.firstName} {res.lastName}</div>
                        <div className="text-muted-foreground text-xs">{res.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="capitalize font-medium">{res.serviceType.replace('_', ' ')}</div>
                        <div className="text-muted-foreground text-xs uppercase">{res.vehicleType}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        ${Number(res.estimatedFare).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(res.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {res.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                              onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                            >
                              <Check size={14} className="mr-1"/> Confirm
                            </Button>
                          )}
                          {(res.status === 'pending' || res.status === 'confirmed') && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleUpdateStatus(res.id, 'cancelled')}
                            >
                              <X size={14} className="mr-1"/> Cancel
                            </Button>
                          )}
                          {res.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                              onClick={() => handleUpdateStatus(res.id, 'completed')}
                            >
                              <Check size={14} className="mr-1"/> Complete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
