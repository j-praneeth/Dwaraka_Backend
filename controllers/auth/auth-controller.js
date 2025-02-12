const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// register
const registerUser = async (req, res) => {
	const { userName, email, password } = req.body;

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists with the same email!",
			});
		}

		const hashPassword = await bcrypt.hash(password, 12);
		const newUser = new User({
			userName,
			email,
			password: hashPassword,
		});

		await newUser.save();

		const { password: _, _id, ...userData } = newUser.toObject();

		res.status(201).json({
			success: true,
			message: "Registration successful",
			user: userData,
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({
			success: false,
			message: "Some error occurred",
		});
	}
};

// login
const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User doesn't exist! Please register first",
			});
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: "Incorrect password! Please try again",
			});
		}

		const token = jwt.sign(
			{
				id: user._id,
				role: user.role,
				email: user.email,
				userName: user.userName,
			},
			"CLIENT_SECRET_KEY",
			{ expiresIn: "60m" }
		);

		const { password: _, _id: id, ...userData } = user.toObject();

		return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id,
                email: user.email,
                role: user.role,
                userName: user.userName,
            },
            token,
        });
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Some error occurred",
		});
	}
};


// logout
const logoutUser = (req, res) => {
	res.clearCookie("token").json({
		success: true,
		message: "Logged out successfully!",
	});
};

// auth middleware
const authMiddleware = async (req, res, next) => {
    // Retrieve token from cookies or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    console.log("Received Token:", token); // Debugging

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized user! No token provided.",
        });
    }

    try {
        // Verify JWT Token
        const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");

        console.log("Decoded Token:", decoded); // Debugging

        req.user = decoded; // Attach user data to request object
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);

        return res.status(401).json({
            success: false,
            message: "Unauthorized user! Invalid or expired token.",
        });
    }
};

const resetPassword = async (req, res) => {
	const { email, newPassword } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user)
			return res.status(404).json({
				success: false,
				message: "User not found. Please check the email provided.",
			});

		user.password = await bcrypt.hash(newPassword, 12);
		await user.save();

		return res.status(200).json({
			success: true,
			message: "Password changed successfully.",
		});
	} catch (e) {
		console.error("Reset password error:", e);
		return res.status(500).json({
			success: false,
			message: "Some error occurred",
		});
	}
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware, resetPassword };