/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SettingsIcon from "@mui/icons-material/Settings";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { styled } from "@mui/material/styles"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts"

// Styled components
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#f5f5f5",
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
  display: "flex",
  alignItems: "center",
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: theme.spacing(1),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}))

const CategoryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#f5f5f5",
  color: "inherit",
  textTransform: "none",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  marginRight: theme.spacing(1),
  fontWeight: 500,
}))

const TimeButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 2),
  textTransform: "none",
  marginRight: theme.spacing(1),
  fontWeight: 500,
}))

const DateButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#f5f5f5",
  color: "inherit",
  textTransform: "none",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  marginRight: theme.spacing(1),
  border: "1px solid #e0e0e0",
  fontWeight: 500,
}))

// Custom CircularProgress component
const CircularProgress = styled(({ value, ...props }) => (
  <Box sx={{ position: "relative", display: "inline-flex" }}>
    <Box
      sx={{
        width: props.size,
        height: props.size,
        borderRadius: "50%",
        background: `radial-gradient(closest-side, white 79%, transparent 80% 100%), 
                    conic-gradient(#3366FF ${value}%, #E0E7FF ${value}% 100%)`,
      }}
    />
  </Box>
))({})

// Mock data
const revenueData = [
  { name: "Sun", thisWeek: 1000, lastWeek: 1200 },
  { name: "Mon", thisWeek: 2000, lastWeek: 1800 },
  { name: "Tue", thisWeek: 1500, lastWeek: 2200 },
  { name: "Wed", thisWeek: 2800, lastWeek: 2000 },
  { name: "Thu", thisWeek: 3300, lastWeek: 2400 },
  { name: "Fri", thisWeek: 3000, lastWeek: 2800 },
  { name: "Sat", thisWeek: 3500, lastWeek: 3000 },
]

const responseData = [
  { name: "New Customers", value: 65, color: "#3366FF" },
  { name: "Old Customers", value: 35, color: "#E0E7FF" },
]

const satisfactionData = [
  { name: "1", value: 40 },
  { name: "2", value: 45 },
  { name: "3", value: 60 },
  { name: "4", value: 55 },
  { name: "5", value: 65 },
  { name: "6", value: 60 },
  { name: "7", value: 80 },
]

const productsData = [
  {
    id: 1,
    name: "iPhone 12 Pro",
    price: "$1200",
    sale: "$32,456.5",
    status: "In Stock",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Ray-Ban RB448N",
    price: "$155",
    sale: "$1,490.65",
    status: "Out of Stock",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Analog Black Dial Watch",
    price: "$275",
    sale: "$3,950.15",
    status: "In Stock",
    image: "/placeholder.svg?height=40&width=40",
  },
]

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: "#fff",
          border: "1px solid #f0f0f0",
          p: 1,
          borderRadius: 1,
          boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={`item-${index}`} variant="body2" color={entry.color} fontWeight="bold">
            {`${entry.name}: $${entry.value}`}
          </Typography>
        ))}
      </Box>
    )
  }
  return null
}

export default function Dashboard() {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalSale: 0,
    totalRevenue: 0,
    totalProfit: 0,
    responseRate: 0,
    satisfactionRate: 0
  });

  useEffect(() => {
    // Fetch orders
    const fetchOrders = async () => {
      try {
        const response = await axios.get('https://dwarakas-backend.vercel.app/api/admin/orders/get', {
          withCredentials: true
        });
        if (response.data.success) {
          setOrders(response.data.data);
          
          // Calculate total sales, revenue and profit
          const totalSale = response.data.data.reduce((acc, order) => acc + order.totalAmount, 0);
          const totalRevenue = totalSale * 0.8; // Assuming 80% of sale is revenue
          const totalProfit = totalSale * 0.3; // Assuming 30% of sale is profit
          
          setStats(prev => ({
            ...prev,
            totalSale,
            totalRevenue,
            totalProfit,
            responseRate: 65, // Default value, update with real data if available
            satisfactionRate: 96.99 // Default value, update with real data if available
          }));
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://dwarakas-backend.vercel.app/api/shop/products/get', {
          withCredentials: true
        });
        if (response.data.success) {
          const topProducts = response.data.data
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 3)
            .map((product, index) => ({
              id: index + 1,
              name: product.title,
              price: `$${product.price}`,
              sale: `$${product.sales * product.price}`,
              status: product.stock > 0 ? 'In Stock' : 'Out of Stock',
              image: product.image
            }));
          setProducts(topProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchOrders();
    fetchProducts();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#f5f8fa", minHeight: "100vh", pb: 4 }}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ bgcolor: "white", boxShadow: "0px 1px 3px rgba(0,0,0,0.05)" }}
      >
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <CategoryButton endIcon={<KeyboardArrowDownIcon />}>All Category</CategoryButton>

          <Search>
            <StyledInputBase placeholder="Search here..." inputProps={{ "aria-label": "search" }} />
          </Search>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TimeButton>Daily</TimeButton>
            <TimeButton sx={{ bgcolor: "#3366FF", color: "white" }}>Monthly</TimeButton>
            <TimeButton>Yearly</TimeButton>

            <DateButton startIcon={<CalendarTodayIcon />}>April 2021</DateButton>

            <IconButton size="large" color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
              <Avatar alt="Diana" src="/placeholder.svg?height=32&width=32" />
              <Typography variant="body1" sx={{ ml: 1, mr: 0.5, fontWeight: 500 }}>
                Diana
              </Typography>
              <KeyboardArrowDownIcon fontSize="small" />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          {/* Revenue Chart */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ borderRadius: 2, overflow: "hidden", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Revenue
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: "#FF6B6B", borderRadius: "50%", mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      This Week
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: "#3366FF", borderRadius: "50%", mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Last Week
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ height: 220, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorThisWeek" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLastWeek" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3366FF" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3366FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9e9e9e", fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(value) => `$${value}`}
                        ticks={[0, 1000, 2000, 3000, 4000]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9e9e9e", fontSize: 12 }}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine x="Fri" stroke="#FF6B6B" strokeDasharray="3 3" />
                      <Area
                        type="monotone"
                        dataKey="thisWeek"
                        stroke="#FF6B6B"
                        fillOpacity={1}
                        fill="url(#colorThisWeek)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="lastWeek"
                        stroke="#3366FF"
                        fillOpacity={1}
                        fill="url(#colorLastWeek)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "40%",
                      right: "25%",
                      bgcolor: "#3366FF",
                      color: "white",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    $2500
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Response Rate */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3, width: "100%" }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Response Rate
                </Typography>
                <Box sx={{ my: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: 150,
                      height: 150,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PieChart width={150} height={150}>
                      <Pie
                        data={responseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={0}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      >
                        {responseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                    <Box sx={{ position: "absolute", textAlign: "center" }}>
                      <Typography variant="h4" component="div" color="primary" fontWeight="bold">
                        65%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ mt: 2, fontWeight: 600 }}>
                    4.8
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Out of 5.0
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: "#3366FF", borderRadius: "50%", mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      65% New Customers
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: "#E0E7FF", borderRadius: "50%", mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      35% Old Customers
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* KPI Cards */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 2, p: 2.5, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    bgcolor: "#E0E7FF",
                    borderRadius: 2,
                    p: 1.5,
                    mr: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SettingsIcon sx={{ color: "#3366FF" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    ${stats.totalSale.toFixed(3)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sale
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 2, p: 2.5, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    bgcolor: "#E0E7FF",
                    borderRadius: 2,
                    p: 1.5,
                    mr: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AttachMoneyIcon sx={{ color: "#3366FF" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    ${stats.totalRevenue.toFixed(3)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 2, p: 2.5, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    bgcolor: "#E0E7FF",
                    borderRadius: 2,
                    p: 1.5,
                    mr: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUpIcon sx={{ color: "#3366FF" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    ${stats.totalProfit.toFixed(3)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Profit
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Top Selling Products */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ borderRadius: 2, boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" fontWeight="600">
                    Top Selling Products
                  </Typography>
                  <Chip
                    label="View All"
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1, color: "#3366FF", borderColor: "#3366FF" }}
                  />
                </Box>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: "#9e9e9e", fontWeight: 500, borderBottom: "1px solid #f0f0f0" }}>
                          No.
                        </TableCell>
                        <TableCell sx={{ color: "#9e9e9e", fontWeight: 500, borderBottom: "1px solid #f0f0f0" }}>
                          Product Name
                        </TableCell>
                        <TableCell sx={{ color: "#9e9e9e", fontWeight: 500, borderBottom: "1px solid #f0f0f0" }}>
                          Price
                        </TableCell>
                        <TableCell sx={{ color: "#9e9e9e", fontWeight: 500, borderBottom: "1px solid #f0f0f0" }}>
                          Sale
                        </TableCell>
                        <TableCell sx={{ color: "#9e9e9e", fontWeight: 500, borderBottom: "1px solid #f0f0f0" }}>
                          Product Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((row) => (
                        <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell component="th" scope="row" sx={{ borderBottom: "1px solid #f0f0f0" }}>
                            {row.id}
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #f0f0f0" }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar
                                src={row.image}
                                alt={row.name}
                                variant="rounded"
                                sx={{ width: 40, height: 40, mr: 2 }}
                              />
                              <Typography fontWeight={500}>{row.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #f0f0f0" }}>{row.price}</TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #f0f0f0" }}>{row.sale}</TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #f0f0f0" }}>
                            <Chip
                              label={row.status}
                              size="small"
                              sx={{
                                bgcolor: row.status === "In Stock" ? "#E0F7EE" : "#FFE9E9",
                                color: row.status === "In Stock" ? "#00A389" : "#FF4D4F",
                                borderRadius: 1,
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Satisfaction Rate */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 2, height: "100%", boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Satisfaction Rate
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  From all projects
                </Typography>

                <Box sx={{ bgcolor: "#FFF5F5", p: 2, borderRadius: 2, mb: 2, mt: 2 }}>
                  <Typography variant="h5" color="#FF4D4F" fontWeight="bold">
                    96.99%
                  </Typography>
                  <Typography variant="body2" color="#FF4D4F">
                    Based on likes
                  </Typography>
                </Box>

                <Box sx={{ height: 150, mt: 4 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={satisfactionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <XAxis dataKey="name" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#FF6B6B"
                        strokeWidth={2}
                        dot={{ r: 0 }}
                        activeDot={{ r: 6, fill: "#FF6B6B", stroke: "white", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}