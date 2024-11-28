import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

// Login controller
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                sno: user.sno
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};

// Register controller
export const register = async (req, res) => {
    try {
        const { username, password, sno } = req.body;
        console.log('Registration attempt:', { username, sno }); // Log registration attempt

        // Validate input
        if (!username || !password || !sno) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Convert sno to number if it's a string
        const snoNumber = parseInt(sno);
        if (isNaN(snoNumber)) {
            console.log('Invalid serial number format');
            return res.status(400).json({ message: 'Serial number must be a valid number' });
        }

        try {
            // Check if username exists
            const existingUser = await User.findOne({ username });
            console.log('Existing user check result:', existingUser);
            
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Check if sno exists
            const existingSno = await User.findOne({ sno: snoNumber });
            console.log('Existing SNO check result:', existingSno);
            
            if (existingSno) {
                return res.status(400).json({ message: 'Serial number already exists' });
            }

            // Create user
            const user = new User({
                username,
                password,
                sno: snoNumber
            });

            await user.save();
            console.log('User created successfully:', user._id);

            res.status(201).json({ message: 'User created successfully' });
        } catch (dbError) {
            console.error('Database operation error:', dbError);
            throw dbError;
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            // MongoDB duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({ message: `${field} already exists` });
        } else {
            res.status(500).json({ message: 'Error during registration' });
        }
    }
};
