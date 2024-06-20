import User from "../model/usermodel.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
    const { name, email, password, gender } = req.body;
  
    console.log('Received request:', { name, email, password, gender });
  
    // Manual validation
    if (!name || !email || !password || !gender) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
  
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('User already exists:', existingUser);
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed:', hashedPassword);
  
      // Create a new user
      console.log('Creating new user...');
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        gender,
      });
  
      // Save the user to the database
      console.log('Saving new user to the database...');
      await newUser.save();
      console.log('User saved:', newUser);
  
      res.status(201).json({ message: 'Registration successful', user: newUser });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Signup failed', error: error.message });
    }
  };
  export const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    // Manual validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
  
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User does not exist' });
      }
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Set session
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
      };
  
      res.status(200).json({ message: 'Login successful', user: req.session.user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  };
  export const logoutUser = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed', error: err.message });
      }
      res.status(200).json({ message: 'Logout successful' });
    });
  };