import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric or underscore'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
});

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback_jwt_secret_pmtool_optimus',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_pmtool_optimus',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }]
    });

    if (existingUser) {
      return res.status(409).json({
        error: existingUser.email === data.email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Default avatar using dicebear or initial letters
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.username)}`;

    const user = await User.create({
      username: data.username,
      email: data.email,
      password: data.password,
      avatar
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to DB (rotation and revocation logic)
    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user || !(await user.comparePassword(data.password))) {
      // Uniform error message for email/password to prevent enumeration
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      // Revoke in DB
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_pmtool_optimus');
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Check user and verify active token in DB
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      // If user refresh token doesn't match, we revoke the session (possible reuse)
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Session expired or reuse detected. Please login again.' });
    }

    // Rotate tokens
    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({
      accessToken: tokens.accessToken
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric or underscore').optional(),
  bio: z.string().max(200).optional(),
  avatar: z.string().url('Invalid avatar URL').or(z.string().length(0)).optional(),
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8).optional()
}).refine(data => {
  if (data.newPassword && !data.currentPassword) return false;
  return true;
}, {
  message: 'Current password is required to change password',
  path: ['currentPassword']
});

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const data = updateProfileSchema.parse(req.body);

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Handle username update and check duplicates
    if (data.username && data.username !== user.username) {
      const existingUser = await User.findOne({ username: data.username });
      if (existingUser) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
      user.username = data.username;
    }

    if (data.bio !== undefined) {
      user.bio = data.bio;
    }

    if (data.avatar !== undefined) {
      user.avatar = data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}`;
    }

    // Handle password update with current password verification
    if (data.newPassword) {
      const isMatch = await user.comparePassword(data.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password' });
      }
      user.password = data.newPassword;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
};
