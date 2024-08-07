const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middlewares/auth');
const userController = require('../controllers/userController');

// Define routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verifyOtp', authController.verifyOtp);
router.get('/getUser/:id', authenticateToken, userController.getUser); 
router.put('/updateUser/:id', authenticateToken, userController.updateUser);
router.delete('/deleteuser/:id', authenticateToken, userController.deleteUser);

module.exports = router;
