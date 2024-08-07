const { db} = require('../database/database');
const bcrypt = require('bcrypt');

class User {
    static async create(userData) {
        const { firstName, lastName, email, phoneNumber, password, address, role } = userData;
        console.log(userData);
        const hashedPassword = await bcrypt.hash(password, 10);

        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO users (first_name, last_name, email, phone_number, password, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [firstName, lastName, email, phoneNumber, hashedPassword, address, role],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId);
                }
            );
        });
    }

    static findByPhoneNumber(phoneNumber) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM users WHERE phone_number = ?`,
                [phoneNumber],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0]);
                }
            );
        });
    }

    static findByUsername(username) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM users WHERE first_name = ? OR email = ?`,
                [username, username],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0]);
                }
            );
        });
    }

    static async storeOtp(userId, otp) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE users SET otp = ?, otp_expiry = ? WHERE id = ?`,
                [otp, new Date(Date.now() + 10 * 60 * 1000), userId], // OTP valid for 10 minutes
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    }

    // New method to find a user by email
    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM users WHERE email = ?',
                [email],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0]);
                }
            );
        });
    }

    // New method to clear OTP after verification
    static clearOtp(userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = ?',
                [userId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    }
    static findById(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT  first_name, last_name, email, phone_number, address, role FROM users WHERE id = ?`,
                [id],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0]);
                }
            );
        });
    }
    static async updateUser(userId, updatedData) {
        const { firstName, lastName, email, phoneNumber, address, role } = updatedData;
        
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address = ?, role = ? WHERE id = ?`,
                [firstName, lastName, email, phoneNumber, address, role, userId],
                (err, result) => {
                    if (err) {
                        console.error('Error updating user:', err);
                        return reject(err);
                    }
                    console.log('Update result:', [firstName, lastName, email, phoneNumber, address, role, userId],);
                    resolve(result);
                }
            );
        });

    }
    static deleteUserById(userId) {
        return new Promise((resolve, reject) => {
            db.query(
                'DELETE FROM users WHERE id = ?',
                [userId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    }
    
}


module.exports = User;
