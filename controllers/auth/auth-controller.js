// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../../models/User");

// //register
// const registerUser = async (req, res) => {
//   const { userName, email, password } = req.body;

//   try {
//     const checkUser = await User.findOne({ email });
//     if (checkUser)
//       return res.json({
//         success: false,
//         message: "User Already exists with the same email! Please try again",
//       });

//     const hashPassword = await bcrypt.hash(password, 12);
//     const newUser = new User({
//       userName,
//       email,
//       password: hashPassword,
//     });

//     await newUser.save();
//     res.status(200).json({
//       success: true,
//       message: "Registration successful",
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured",
//     });
//   }
// };

// //login
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const checkUser = await User.findOne({ email });
//     if (!checkUser)
//       return res.json({
//         success: false,
//         message: "User doesn't exists! Please register first",
//       });

//     const checkPasswordMatch = await bcrypt.compare(
//       password,
//       checkUser.password
//     );
//     if (!checkPasswordMatch)
//       return res.json({
//         success: false,
//         message: "Incorrect password! Please try again",
//       });

//     const token = jwt.sign(
//       {
//         id: checkUser._id,
//         role: checkUser.role,
//         email: checkUser.email,
//         userName: checkUser.userName,
//       },
//       "CLIENT_SECRET_KEY",
//       { expiresIn: "60m" }
//     );

//     res.cookie("token", token, { httpOnly: true, secure: false }).json({
//       success: true,
//       message: "Logged in successfully",
//       user: {
//         email: checkUser.email,
//         role: checkUser.role,
//         id: checkUser._id,
//         userName: checkUser.userName,
//       },
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured",
//     });
//   }
// };

// //logout

// const logoutUser = (req, res) => {
//   res.clearCookie("token").json({
//     success: true,
//     message: "Logged out successfully!",
//   });
// };

// //auth middleware
// const authMiddleware = async (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token)
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorised user!",
//     });

//   try {
//     const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: "Unauthorised user!",
//     });
//   }
// };

// module.exports = { registerUser, loginUser, logoutUser, authMiddleware };


const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require("../../models/User");

let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (err) {
  console.error('Failed to load bcryptjs:', err);
  // Fallback to a simple hash function if bcrypt fails
  bcrypt = {
    hash: async (password) => Buffer.from(password).toString('base64'),
    compare: async (password, hash) => 
      Buffer.from(password).toString('base64') === hash,
    genSalt: async () => 10
  };
}

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',  // Allow all origins, or specify an origin (e.g., 'http://localhost:3000')
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Register user
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.status(400).json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password attempt for user:", email); // Log invalid attempt
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true }).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        userName: user.userName
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};

// Logout user - Make sure to invalidate the token
const logoutUser = (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully!"
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: "Logout failed"
    });
  }
};

// Update the auth middleware to handle non-expiring tokens
const authMiddleware = async (req, res, next) => {
  try {
    // Check for Authorization header first
    const authHeader = req.headers.authorization;
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Fallback to cookie
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required! Please login.",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
      
      // Fetch user from database to ensure they still exist and are still active
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists",
        });
      }

      // Check if user is active
      if (user.status === 'inactive') {
        return res.status(401).json({
          success: false,
          message: "User account is inactive",
        });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};


const resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  try {
    // Validate input
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match!",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 12);
    
    // Update the user in the database
    await user.save(); // This line updates the user's password in the database

    // Log the user in with the new password
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true }).json({
      success: true,
      message: "Password has been reset successfully! You are now logged in.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        userName: user.userName
      }
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};


app.post('/login', loginUser);

module.exports = { registerUser, loginUser, logoutUser, authMiddleware, resetPassword };
