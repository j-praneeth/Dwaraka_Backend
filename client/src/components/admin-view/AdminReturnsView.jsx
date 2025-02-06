import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useDispatch, useSelector } from "react-redux";
import { getAllReturnRequests } from "@/store/admin/order-slice"; // Create this action

function AdminReturnsView() {
  const [returnRequests, setReturnRequests] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchReturnRequests = async () => {
      const response = await dispatch(getAllReturnRequests());
      if (response.payload.success) {
        setReturnRequests(response.payload.data);
      }
    };

    fetchReturnRequests();
  }, [dispatch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Return Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Return Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returnRequests.map((request) => (
              <TableRow key={request.orderId}>
                <TableCell>{request.orderId}</TableCell>
                <TableCell>{request.userId.userName}</TableCell>
                <TableCell>{request.returnRequest.status}</TableCell>
                <TableCell>
                  {/* Add buttons for actions like approve/cancel */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminReturnsView; 