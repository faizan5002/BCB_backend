const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const app = express();

// Middlewares
app.use(bodyParser.json());

// Routes
app.use('/', authRoutes);

// Example protected route
// app.get('/protected', authMiddleware, (req, res) => {
//     res.status(200).json({ message: 'Protected content accessed', user: req.user });
// });

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
