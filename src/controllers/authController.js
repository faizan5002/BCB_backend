const { db, JWT_SECRET } = require('../database/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
// Store OTP temporarily (you may want to use a database or in-memory store for production)
let otpStore = {};
// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'no-reply@switch.com.pk',
        pass: 'FiTfL3X1997'
    }
});;

// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: 'no-reply@switch.com.pk',
        to: email,
        subject: 'Login Verification Code',
        text: `Your verification code is: ${otp}`
    };
    await transporter.sendMail(mailOptions);
};

// Generate OTP
const generateOtp = () => {
    return crypto.randomInt(1000, 10000).toString(); // 4-digit OTP
};

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phoneNumber, password, confirmPassword, address, role } = req.body;

    try {
        const existingUser = await User.findByPhoneNumber(phoneNumber);

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const userId = await User.create({ firstName, lastName, email, phoneNumber, password, address, role });

        const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.login = async (req, res) => {
    console.log('Login endpoint hit');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        // Find user by email or first_name (username)
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare provided password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        // Generate and send OTP
        const otp = generateOtp();
        // Store OTP in the database associated with the user
        await User.storeOtp(user.id, otp);

        await sendOtpEmail(user.email, otp);

        res.status(200).json({ auth: token, message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    console.log(otp);
    
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        // Retrieve the user by email
        const user = await User.findByEmail(email);
        console.log(user);
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or user does not exist' });
        }

        // Check if the OTP matches and is still valid
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Incorrect OTP' });
        }

        if (new Date(user.otp_expiry) < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // OTP is valid, clear OTP from database
        await User.clearOtp(user.id);

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


