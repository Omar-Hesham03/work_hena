const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validators');
const { sendPasswordResetEmail } = require('../services/emailService');

module.exports = (supabase) => {

  // Register new user
  router.post('/register', validateRegister, async (req, res) => {
    try {
      const { email, password, full_name, user_type, phone, company_name } = req.body;

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password: hashedPassword,
            full_name,
            user_type,
            phone: phone || null,
            company_name: company_name || null,
            avatar: null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const token = jwt.sign(
        { userId: data.id, email: data.email, user_type: data.user_type },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          user_type: data.user_type,
          avatar: data.avatar
        }
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Login user
  router.post('/login', validateLogin, async (req, res) => {
    try {
      const { email, password } = req.body;

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, user_type: user.user_type },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          user_type: user.user_type,
          avatar: user.avatar
        }
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user avatar
  router.put('/update-avatar', authenticateToken, async (req, res) => {
    try {
      const { avatar } = req.body;

      const { data, error } = await supabase
        .from('users')
        .update({ avatar })
        .eq('id', req.user.userId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        message: 'Avatar updated successfully',
        user: {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          user_type: data.user_type,
          avatar: data.avatar
        }
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // FORGOT PASSWORD
  // ============================================
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user exists
      const { data: user } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('email', email)
        .single();

      // Always return success to prevent email enumeration attacks
      if (!user) {
        return res.json({ message: 'If that email exists, a reset link has been sent.' });
      }

      // Generate a secure random token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Invalidate any existing tokens for this user
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('user_id', user.id)
        .eq('used', false);

      // Save new token
      const { error } = await supabase
        .from('password_reset_tokens')
        .insert([{
          user_id: user.id,
          token,
          expires_at: expiresAt.toISOString()
        }]);

      if (error) throw error;

      // Send reset email
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      await sendPasswordResetEmail(user.email, user.full_name, resetUrl);

      res.json({ message: 'If that email exists, a reset link has been sent.' });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  });

  // ============================================
  // RESET PASSWORD
  // ============================================
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: 'Token and password are required' });
      }

      // Password strength check
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      // Find the token
      const { data: resetToken, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (tokenError || !resetToken) {
        return res.status(400).json({ error: 'Invalid or expired reset link' });
      }

      // Check expiry
      if (new Date(resetToken.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', resetToken.user_id);

      if (updateError) throw updateError;

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', resetToken.id);

      res.json({ message: 'Password reset successfully! You can now log in.' });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  return router;
};