const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to handle form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static HTML files (your frontend form)
app.use(express.static('public'));

// Route to handle form submission
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Check if all required fields are provided
    if (!username || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    // Log the user data (you would store this in a database in a real app)
    console.log(`User Registered: Username - ${username}, Email - ${email}`);

    // Send success response back to frontend
    res.json({ message: 'Registration successful!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
