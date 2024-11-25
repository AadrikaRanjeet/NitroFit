require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Make sure this line is included for path resolution
const User = require('./models/User'); // Import the User model
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For JWT generation and verification
const Appointment = require('./models/Appointment');
const app = express();

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoUri = process.env.MONGO_URI; // Get MongoDB URI from .env file

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('Failed to connect to MongoDB:', err));

// Serve static files from the "public" folder
app.use(express.static('public'));

// JWT Authentication Middleware (move this above routes that use it)
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from the Authorization header

  if (!token) {
    return res.status(401).send('Access Denied');
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;  // Add the verified user data to the request
    next();  // Continue to the next middleware or route handler
  } catch (error) {
    res.status(400).send('Invalid Token');
  }
};

// Routes

// Send the index.html file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Adjust path to match your HTML file location
});

// Send the login.html file for the login route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html')); // Adjust path to match your HTML file location
});

// Send the register.html file for the /register route
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html')); // Adjust path to match your HTML file location
});

// Handle appointment creation (protected route)
app.post('/appointments', async (req, res) => {
  const { name, email, phone, appointmentDate } = req.body;

  try {
    const appointment = new Appointment({
      userId: req.user.id, // Assuming you have a way to get the user ID
      appointmentDate,
    });

    await appointment.save();
    res.status(201).send('Appointment booked');
  } catch (error) {
    res.status(400).send('Failed to book the appointment');
  }
});

// Get all appointments for the logged-in user (protected route)
app.get('/appointments', authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.userId });
    
    if (!appointments.length) {
      return res.status(404).send('No appointments found');
    }

    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send('Failed to fetch appointments');
  }
});

// Registration route
app.post('/submit-registration', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
});

// Login route
app.post('/submit-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Incorrect password');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in user');
  }
});

// Protected route example
app.get('/dashboard', authenticateToken, (req, res) => {
  res.send('Welcome to the dashboard, ' + req.user.userId);
});

// Set the port and start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
