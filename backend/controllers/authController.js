const User   = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')

async function register(req, res) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are all required.' })
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user   = await User.create({ name, email, password: hashed })

    return res.status(201).json({ message: 'User created', userId: user._id })
  } catch (err) {
    console.error('Register Error:', err)
    return res.status(500).json({ message: 'Server error, check logs for details.' })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Preparamos un objeto de usuario sin el password para enviarlo al frontend
    const userForFrontend = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
    };

    return res.json({ token, user: userForFrontend })
  } catch (err) {
    console.error('Login Error:', err)
    return res.status(500).json({ message: 'Server error, check logs for details.' })
  }
}

async function dashboard(req, res) {
  try {
    // `req.userId` was set by authMiddleware
    const user = await User.findById(req.userId).select('-password')
    return res.json({ data: user })
  } catch (err) {
    console.error('Dashboard Error:', err)
    return res.status(401).json({ message: 'Token invalid' })
  }
}

async function updateProfile(req, res) {
  try {
    const { name, email, phone } = req.body;
    
    // Validar que al menos un campo se esté actualizando
    if (!name && !email && !phone) {
      return res.status(400).json({ message: 'At least one field must be provided for update' });
    }

    // Verificar si el email ya existe (si se está actualizando)
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Actualizar el usuario
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ 
      message: 'Profile updated successfully',
      data: updatedUser 
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({ message: 'Server error, check logs for details.' });
  }
}

async function forgotPassword(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no.
      return res.status(200).json({ message: 'If a user with that email exists, a reset link has been sent.' });
    }

    // Generar token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hashear token y guardarlo en la DB
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Establecer expiración (10 minutos)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Crear URL de reseteo
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email HTML y texto plano
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border:1px solid #eee; border-radius:10px; padding:24px;">
        <img src="https://coolgeeks.app/logo.png" alt="CoolGeeks Logo" style="width:120px; margin-bottom:16px;" />
        <h2 style="color:#667eea;">Reset your password</h2>
        <p>Hello${user.name ? ' ' + user.name : ''},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display:inline-block; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; padding:14px 28px; border-radius:6px; text-decoration:none; font-weight:bold; margin:16px 0;">Reset Password</a>
        <p>If you did not request this, you can safely ignore this email.</p>
        <hr style="margin:24px 0;">
        <p style="font-size:13px; color:#888;">CoolGeeks App Team</p>
      </div>
    `;

    const textMessage = `
Hello${user.name ? ' ' + user.name : ''},

We received a request to reset your password. Use the link below to set a new password:
${resetUrl}

If you did not request this, you can safely ignore this email.

CoolGeeks App Team
`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        text: textMessage,
        html: htmlMessage,
      });

      res.status(200).json({ message: 'Email sent' });
    } catch (err) {
      console.error('Email sending error:', err);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    console.error('Forgot Password Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function resetPassword(req, res) {
  try {
    // Hashear el token que viene en la URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }, // Comprueba que no ha expirado
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Establecer la nueva contraseña
    user.password = await bcrypt.hash(req.body.password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Opcional: generar un nuevo token de login y enviar al usuario
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({ success: true, token, message: 'Password updated successfully' });

  } catch (err) {
    console.error('Reset Password Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login, dashboard, updateProfile, forgotPassword, resetPassword }
