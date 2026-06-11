const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validators');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../services/emailService');

module.exports = (supabase) => {

  // ============================================
  // REGISTER
  // ============================================
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
            avatar: null,
            email_verified: false,
            credits: user_type === 'recruiter' ? 10 : 0,
            total_credits_purchased: 0,
            first_credit_purchase: false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Generate verification token (24 hours)
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await supabase
        .from('email_verification_tokens')
        .insert([{ user_id: data.id, token, expires_at: expiresAt.toISOString() }]);

      // Send verification email
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
      await sendVerificationEmail(data.email, data.full_name, verifyUrl);

      const jwtToken = jwt.sign(
        { userId: data.id, email: data.email, user_type: data.user_type },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token: jwtToken,
        user: {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          user_type: data.user_type,
          avatar: data.avatar,
          email_verified: false
        }
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // LOGIN
  // ============================================
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
          avatar: user.avatar,
          email_verified: user.email_verified
        }
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // UPDATE AVATAR
  // ============================================
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
          avatar: data.avatar,
          email_verified: data.email_verified
        }
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // VERIFY EMAIL
  // ============================================
  router.post('/verify-email', async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      const { data: verifyToken, error: tokenError } = await supabase
        .from('email_verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (tokenError || !verifyToken) {
        return res.status(400).json({ error: 'Invalid or already used verification link' });
      }

      if (new Date(verifyToken.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
      }

      // Mark user as verified
      await supabase
        .from('users')
        .update({ email_verified: true })
        .eq('id', verifyToken.user_id);

      // Mark token as used
      await supabase
        .from('email_verification_tokens')
        .update({ used: true })
        .eq('id', verifyToken.id);

      res.json({ message: 'Email verified successfully!' });

    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  });

  // ============================================
  // RESEND VERIFICATION EMAIL
  // ============================================
  router.post('/resend-verification', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;

      const { data: user } = await supabase
        .from('users')
        .select('email, full_name, email_verified')
        .eq('id', userId)
        .single();

      if (user.email_verified) {
        return res.status(400).json({ error: 'Email is already verified' });
      }

      // Invalidate old tokens
      await supabase
        .from('email_verification_tokens')
        .update({ used: true })
        .eq('user_id', userId)
        .eq('used', false);

      // Generate new token (24 hours)
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await supabase
        .from('email_verification_tokens')
        .insert([{ user_id: userId, token, expires_at: expiresAt.toISOString() }]);

      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
      await sendVerificationEmail(user.email, user.full_name, verifyUrl);

      res.json({ message: 'Verification email sent!' });

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: 'Failed to resend verification email' });
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

      const { data: user } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('email', email)
        .single();

      if (!user) {
        return res.json({ message: 'If that email exists, a reset link has been sent.' });
      }

      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('user_id', user.id)
        .eq('used', false);

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await supabase
        .from('password_reset_tokens')
        .insert([{ user_id: user.id, token, expires_at: expiresAt.toISOString() }]);

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

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const { data: resetToken, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (tokenError || !resetToken) {
        return res.status(400).json({ error: 'Invalid or expired reset link' });
      }

      if (new Date(resetToken.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', resetToken.user_id);

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