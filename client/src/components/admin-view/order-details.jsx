/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

// function formatDate(dateString) {
//   const date = new Date(dateString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`;
// }

function formatDate(dateString, format = "YYYY-MM-DD") {
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date"; // Handle invalid input

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  if (format === "DD-MM-YYYY") {
    return `${day}-${month}-${year}`;
  }
  return date.toISOString().split("T")[0];
}


function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const dispatch = useDispatch();
  const { toast } = useToast();

  console.log(orderDetails, "orderDetailsorderDetails");

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  const handlePrintOrder = () => {
    const printWindow = window.open("", "_blank");
    const currentYear = new Date().getFullYear();

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              padding: 20px;
            }
            .invoice-container {
              width: 600px;
              background-color: #fff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .logo h1 {
              font-size: 36px;
              color: #66bb6a;
              font-family: 'Grandis Extended';
            }
            .invoice-details p {
              margin-bottom: 5px;
              text-align: right;
            }
            .address {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .company-address p,
            .client-address p {
              margin-bottom: 5px;
            }
            .items table {
              width: 100%;
              margin-bottom: 30px;
              border-collapse: collapse;
            }
            .items th, .items td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .items th {
              background-color: #f1f1f1;
            }
            .total table {
              width: 100%;
              border-collapse: collapse;
            }
            .total td {
              padding: 10px;
              text-align: left;
            }
            .total td:last-child {
              text-align: right;
            }
            .client-address p {
              white-space: normal;
              word-wrap: break-word; 
              overflow-wrap: break-word; 
              max-width: 200px; 
            }

            .text-wrap {
              white-space: normal;
              word-wrap: break-word; 
              overflow-wrap: break-word; 
            }
            footer {
              text-align: center;
              margin-top: 30px;
              font-size: 14px;
              color: #555;
            }
            footer p {
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <header class="invoice-header">
                <div class="logo">
                    <h1>DWARAKA HANDLOOMS</h1>
                </div>
                <br/>
                <div class="invoice-details">
                    <p><strong>Invoice:</strong> ${orderDetails?._id}</p>
                    <p><strong>Order Date:</strong> ${orderDetails?.orderDate.split("T")[0].split("-").reverse().join("-")}</p>
                    <p><strong>Delivery Date:</strong> ${formatDate(new Date(new Date(orderDetails?.orderDate).getTime() + 7 * 24 * 60 * 60 * 1000), "DD-MM-YYYY")}</p>
                </div>
            </header>
            <br/>
            <section class="address">
            <div class="company-address">
                <h4>Ship from:</h4>
                <br/>
                <p>Dwaraka Handlooms</p>
                <p>Boduppal, Telangana</p>
                <p>Hyderabad, 500092</p>
              </div>
            <div class="client-address text-right">
              <h4 class="text-right">Ship to:</h4>
              <br/>
              <p>${orderDetails?.userId?.userName}</p>
              <p>${orderDetails?.addressInfo?.city}, ${orderDetails?.addressInfo?.pincode}</p>
              <p class="text-wrap">${orderDetails?.addressInfo?.address}</p>
            </div>
            </section>

            <section class="items">
                <table>
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderDetails?.cartItems.map(item => `
                        <tr>
                            <td>${item.title} (x${item.quantity})</td>
                            <td>₹${(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </section>

            <section class="total">
                <table>
                    <tbody>
                        <tr>
                            <td>Subtotal:</td>
                            <td>₹${orderDetails?.totalAmount.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>GST:</td>
                            <td> ${(orderDetails?.totalAmount * 0.0).toLocaleString()}%</td>
                        </tr>
                        <tr>
                            <td><strong>Total:</strong></td>
                            <td><strong>₹${(orderDetails?.totalAmount * 1.0).toLocaleString()}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <footer>
                <p>Thank you, happy shopping again</p>
                <p>© ${currentYear} Dwaraka Handlooms. All Rights Reserved</p>
            </footer>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };










  return (
    <DialogContent className="sm:max-w-[600px] p-12 h-[95vh] overflow-auto">
      <div className="grid gap-6" id="printableOrder">
        <button onClick={handlePrintOrder} className="mb-4 w-full sm:w-auto bg-blue-500 text-white p-2 rounded">
          Print Order
        </button>
        <div className="grid gap-2">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <p className="font-medium">Order Date</p>
            <Label>
              {orderDetails?.orderDate.split("T")[0].split("-").reverse().join("-")}
            </Label>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <p className="font-medium">Order Price</p>
            <Label>₹{orderDetails?.totalAmount}</Label>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <p className="font-medium">Payment method</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>{orderDetails?.paymentStatus}</Label>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <p className="font-medium">Order Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${orderDetails?.orderStatus === "confirmed"
                  ? "bg-green-500"
                  : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : "bg-black"
                  }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <p className="font-medium">Customer Username</p>
            <Label>{orderDetails?.userId?.userName}</Label>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Details</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item) => (
                  <li className="flex items-center justify-between">
                    <span>Title: {item.title}</span>
                    <span>Quantity: {item.quantity}</span>
                    <span>Price: ₹{item.price}</span>
                  </li>
                ))
                : null}
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Shipping Info</div>
            <div className="grid gap-0.5 text-black font-bold">
              <span>{orderDetails?.userId?.userName}</span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city}</span>
              <span>{orderDetails?.addressInfo?.pincode}</span>
              <span>{orderDetails?.addressInfo?.phone}</span>
              <span>{orderDetails?.addressInfo?.notes}</span>
            </div>
          </div>
        </div>

        <div>
          <CommonForm
            formControls={[
              {
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "pending" },
                  { id: "inProcess", label: "inProcess" },
                  { id: "inShipping", label: "inShipping" },
                  { id: "delivered", label: "delivered" },
                  { id: "rejected", label: "rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Order Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
