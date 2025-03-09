import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useDispatch, useSelector } from "react-redux";
import { fetchRefunds, processRefund, clearRefundError } from "@/store/admin/refund-slice";
import { useToast } from "../ui/use-toast";
import { Badge } from "../ui/badge";
import { Loader2, IndianRupee } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

function AdminRefundsView() {
  const dispatch = useDispatch();
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState("Pending");
  const { refunds, isLoading, error } = useSelector((state) => state.refund);
  const { toast } = useToast();

  useEffect(() => {
    loadRefunds();
    return () => {
      dispatch(clearRefundError());
    };
  }, [dispatch]);

  const loadRefunds = async () => {
    try {
      await dispatch(fetchRefunds()).unwrap();
    } catch (err) {
      console.error("Error loading refunds:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load refunds",
        variant: "destructive",
      });
    }
  };

  const handleProcessRefund = async (orderId) => {
    try {
      setProcessingId(orderId);
      const result = await dispatch(processRefund(orderId)).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: "Refund processed successfully!",
        });

        // Update the local state to reflect the processed refund
        const updatedRefund = { ...result.data, refundStatus: "Refunded" };
        const updatedRefunds = refunds.map(refund =>
          refund._id === updatedRefund._id ? { ...refund, refundStatus: "Refunded" } : refund
        );

        // Update the refunds state with the new list
        dispatch({ type: 'refund/updateRefunds', payload: updatedRefunds });
      }
    } catch (error) {
      console.error("Process refund error:", error);
      toast({
        title: "Error",
        description: error || "Failed to process refund",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading refunds...</span>
      </div>
    );
  }

  // Sort refunds to show the latest first
  const sortedRefunds = [...refunds].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  // Filter refunds based on the selected filter
  // Filter refunds based on the selected filter
  const filteredRefunds = sortedRefunds.filter(refund =>
    filter === "Pending"
      ? refund.refundStatus !== "Refunded" && refund.paymentStatus === "paid" && refund.refundStatus === "Inprocess"
      : refund.refundStatus === "Refunded"
  );

  // const filteredRefunds = sortedRefunds.filter(refund => 
  //   filter === "Pending" ? refund.refundStatus !== "Refunded" : refund.refundStatus === "Refunded"
  // );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Refund Management</h2>
        <p className="text-muted-foreground">
          Process and manage customer refund requests
        </p>
      </div>

      <div className="flex space-x-4 mb-4">
        <Button onClick={() => setFilter("Pending")} variant={filter === "Pending" ? "default" : "outline"}>
          Pending Refunds
        </Button>
        <Button onClick={() => setFilter("Refunded")} variant={filter === "Refunded" ? "default" : "outline"}>
          Completed Refunds
        </Button>
      </div>

      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{filter === "Pending" ? "Pending Refunds" : "Completed Refunds"}</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRefunds.length}</div>
            <p className="text-xs text-muted-foreground">
              {filter === "Pending" ? "Refunds awaiting processing" : "Refunds that have been completed"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedRefunds.filter(refund => refund.paymentStatus === "paid" &&
                (refund.refundStatus === "Inprocess" || refund.refundStatus === "Refunded")
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              All valid refund requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunded Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{sortedRefunds
                .filter(refund => refund.paymentStatus === "paid" && refund.refundStatus === "Refunded")
                .reduce((sum, refund) => sum + refund.totalAmount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total amount refunded to customers
            </p>
          </CardContent>
        </Card>



        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedRefunds.length}</div>
            <p className="text-xs text-muted-foreground">
              All refund requests
            </p>
          </CardContent>
        </Card> */}
      </div>

      {!filteredRefunds.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No Refund Requests</CardTitle>
            <CardDescription>
              There are currently no refund requests in the system.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Refund Requests</CardTitle>
            <CardDescription>
              List of all refund requests - newest first
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.map((order) => (
                  <TableRow
                    key={order._id}
                    className={order.refundStatus === "Refunded" ? "bg-green-50" : ""}
                  >
                    <TableCell className="font-medium">{order._id}</TableCell>
                    <TableCell>
                      {order.userId?.userName || order.addressInfo?.name || "N/A"}
                      {order.userId?.email && ` (${order.userId.email})`}
                    </TableCell>
                    <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={order.refundStatus === "Refunded" ? "success" : "warning"}
                        className={order.refundStatus === "Refunded" ? "bg-green-100 text-green-800" : ""}
                      >
                        {order.refundStatus === "Refunded" ? "Completed Refund" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleProcessRefund(order._id)}
                        disabled={order.refundStatus === "Refunded" || processingId === order._id}
                        variant={order.refundStatus === "Refunded" ? "outline" : "default"}
                        size="sm"
                      >
                        {processingId === order._id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : order.refundStatus === "Refunded" ? (
                          "Completed"
                        ) : (
                          "Process Refund"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdminRefundsView;