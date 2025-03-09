/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useDispatch } from "react-redux";
import { getAllReturnRequests, processReturnRequest, requestReturn, cancelReturnRequest, updateReturnStatus, updateRefundStatus } from "@/store/admin/order-slice"; // Ensure these actions are defined

function AdminReturnsView() {
  const [returnRequests, setReturnRequests] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchReturnRequests = async () => {
      const response = await dispatch(getAllReturnRequests());
      if (response.payload.success) {
        setReturnRequests(response.payload.data);
      } else {
        console.error("Failed to fetch return requests:", response.payload.message);
      }
    };

    fetchReturnRequests();
  }, [dispatch]);

  console.log("Rendering AdminReturnsView"); // Debugging statement

  const handleProcessReturn = async (orderId) => {
    const response = await dispatch(processReturnRequest(orderId));
    if (response.payload.success) {
      // Optionally, refetch return requests after processing
      const updatedResponse = await dispatch(getAllReturnRequests());
      if (updatedResponse.payload.success) {
        setReturnRequests(updatedResponse.payload.data);
      }
    } else {
      console.error("Failed to process return request:", response.payload.message);
    }
  };

  // const handleRequestReturn = async (orderId, reason, description, images) => {
  //   const response = await dispatch(requestReturn({ orderId, reason, description, images }));
  //   if (response.payload.success) {
  //     // Optionally, refetch return requests after submitting a return request
  //     const updatedResponse = await dispatch(getAllReturnRequests());
  //     if (updatedResponse.payload.success) {
  //       setReturnRequests(updatedResponse.payload.data);
  //     }
  //   } else {
  //     console.error("Failed to request return:", response.payload.message);
  //   }
  // };

  const handleCancelReturn = async (orderId) => {
    const response = await dispatch(cancelReturnRequest(orderId));
    if (response.payload.success) {
      // Optionally, refetch return requests after canceling
      const updatedResponse = await dispatch(getAllReturnRequests());
      if (updatedResponse.payload.success) {
        setReturnRequests(updatedResponse.payload.data);
      }
    } else {
      console.error("Failed to cancel return request:", response.payload.message);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    const response = await dispatch(updateReturnStatus({ orderId, status }));
    if (response.payload.success) {
      // Optionally, refetch return requests after updating
      const updatedResponse = await dispatch(getAllReturnRequests());
      if (updatedResponse.payload.success) {
        setReturnRequests(updatedResponse.payload.data);
      }
    } else {
      console.error("Failed to update return request status:", response.payload.message);
    }
  };

  const handleRefundStatusChange = async (orderId, refundStatus) => {
    const response = await dispatch(updateRefundStatus({ orderId, refundStatus }));
    if (response.payload.success) {
      // Optionally, refetch return requests after updating
      const updatedResponse = await dispatch(getAllReturnRequests());
      if (updatedResponse.payload.success) {
        setReturnRequests(updatedResponse.payload.data);
      }
    } else {
      console.error("Failed to update refund status:", response.payload.message);
    }
  };

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
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              {/* <TableHead>User ID</TableHead> */}
              <TableHead>Return Status</TableHead>
              {/* <TableHead>Refund Status</TableHead> */}
              {/* <TableHead>Action</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {returnRequests
              .filter((request) => request.returnRequest && request.returnRequest.status) // Ensure returnRequest exists
              .map((request) => (

                <TableRow key={request.orderId}>
                  <TableCell>{request.orderId}</TableCell>
                  
                  <TableCell>
                    <select
                      value={request.returnRequest.status}
                      onChange={(e) => handleStatusChange(request.orderId, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </TableCell>

                  {/* Removed Refund Status updation.
                   <TableCell>
                    <select
                      value={request.refundStatus}
                      onChange={(e) => handleRefundStatusChange(request.orderId, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </TableCell> */}
                  {/* <TableCell>
                    <button onClick={() => handleProcessReturn(request.orderId)}>Process</button>
                    <button onClick={() => handleCancelReturn(request.orderId)}>Cancel Return</button>
                  </TableCell> */}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminReturnsView; 