import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check if login credentials completed
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }
    // find the user using email
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    // compare password on hashed password in database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    // creating JWT toker
    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d", // Token expires in 7 days
      },
    );
    // back to token and user information
    return res.status(200).json({
      message: "Login successfull",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 1. Validation ng required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required",
      });
    }

    // 2. Check kung may umiiral nang email
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }

    // 3. I-hash ang password gamit ang bcrypt (10 rounds)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. I-create ang bagong admin user gamit ang hashed password
    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "librarian",
    });

    // 5. I-return ang response na HINDI kasama ang password
    return res.status(201).json({
      message: "Admin registered successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error registering admin:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
