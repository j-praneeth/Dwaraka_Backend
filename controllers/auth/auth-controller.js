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


// const express = require('express');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require("../../models/User");

// const app = express();
// app.use(express.json());
// app.use(cors({
//   origin: '*',  // Allow all origins, or specify an origin (e.g., 'http://localhost:3000')
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// // Register user
// const registerUser = async (req, res) => {
//   const { userName, email, password } = req.body;

//   try {
//     const checkUser = await User.findOne({ email });
//     if (checkUser)
//       return res.status(400).json({
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
//       message: "Some error occurred",
//     });
//   }
// };

// // Login user
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const checkUser = await User.findOne({ email });
//     if (!checkUser)
//       return res.status(400).json({
//         success: false,
//         message: "User doesn't exist! Please register first",
//       });

//     const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
//     if (!checkPasswordMatch)
//       return res.status(401).json({
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

//     res.cookie("token", token, { httpOnly: true, secure: false }).status(200).json({
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
//       message: "Some error occurred",
//     });
//   }
// };

// // Logout user
// const logoutUser = (req, res) => {
//   res.clearCookie("token").json({
//     success: true,
//     message: "Logged out successfully!",
//   });
// };

// // Middleware to check authentication
// const authMiddleware = async (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token)
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized user!",
//     });

//   try {
//     const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: "Unauthorized user!",
//     });
//   }
// };

// app.post('/login', loginUser);

// module.exports = { registerUser, loginUser, logoutUser, authMiddleware };

const express = require('express');
const cors = require('cors');
const { hash } = require("argon2-wasm"); // Import `hash` from argon2-wasm
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require("crypto");
const User = require("../../models/User");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const SECRET_KEY = process.env.CLIENT_SECRET_KEY || "CLIENT_SECRET_KEY"; // Use environment variable

// ✅ Hash Password Function
async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex"); // Generate random salt
    const hashedPassword = await hash({ pass: password, salt });

    return `${salt}:${hashedPassword.hashHex}`; // Store salt and hash together
}

// ✅ Verify Password Function
async function verifyPassword(password, storedHash) {
    const [salt, hashHex] = storedHash.split(":"); // Extract salt and hash
    const newHash = await hash({ pass: password, salt }); // Hash the entered password with the same salt

    return newHash.hashHex === hashHex; // Compare the hashes
}

// **Register User**
const registerUser = async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists! Please try again",
            });
        }

        // ✅ Hash password before storing
        const hashedPassword = await hashPassword(password);

        const newUser = new User({
            userName,
            email,
            password: hashedPassword, // Store hashed password
        });

        await newUser.save();
        res.status(200).json({
            success: true,
            message: "Registration successful",
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred",
        });
    }
};

// **Login User**
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const checkUser = await User.findOne({ email });

        if (!checkUser) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exist! Please register first",
            });
        }

        // Debugging logs
        console.log("Entered Password:", password);
        console.log("Stored Hashed Password:", checkUser.password);

        // ✅ Compare entered password with stored hash
        const checkPasswordMatch = await verifyPassword(password, checkUser.password);

        if (!checkPasswordMatch) {
            console.log("Password does not match!");
            return res.status(401).json({
                success: false,
                message: "Incorrect password! Please try again",
            });
        }

        // ✅ If password matches, generate JWT token
        const token = jwt.sign(
            {
                id: checkUser._id,
                role: checkUser.role,
                email: checkUser.email,
                userName: checkUser.userName,
            },
            SECRET_KEY,
            { expiresIn: "60m" }
        );

        res.cookie("token", token, { httpOnly: true, secure: false }).status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                email: checkUser.email,
                role: checkUser.role,
                id: checkUser._id,
                userName: checkUser.userName,
            },
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred",
        });
    }
};

// **Logout User**
const logoutUser = (req, res) => {
    res.clearCookie("token").json({
        success: true,
        message: "Logged out successfully!",
    });
};

// **Authentication Middleware**
const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized user!",
        });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized user!",
        });
    }
};

// **API Routes**
app.post('/login', loginUser);
app.post('/register', registerUser);
app.post('/logout', logoutUser);

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };
