import User from "../model/usermodel.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  const { name, email, password, gender } = req.body;

  console.log('Received request:', { name, email, password, gender });

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
