const User = require('../models/User');

exports.getUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, email, phoneNumber, address, role } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !phoneNumber || !address || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    console.log('Updating user with ID:', userId);
    console.log('Updated data:', { firstName, lastName, email, phoneNumber, address, role });

    try {
        // Update user in the database
        const result = await User.updateUser(userId, { firstName, lastName, email, phoneNumber, address, role });
        
        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await User.deleteUserById(userId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};