const { getModel } = require('../utils/adapter');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const User = getModel('User');
    const { name, email, password, role, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role || 'client', phone, address });
    const token = generateToken(user._id);

    // Set token as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const User = getModel('User');
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Compte désactivé - Contactez l\'administrateur' });
    }

    const token = generateToken(user._id);

    // Set token as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const User = getModel('User');
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    const doc = user.toJSON ? user.toJSON() : (user._doc || user);
    const { password, ...userWithoutPassword } = doc;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    // Clear the token cookie — force immediate expiration
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Force expiration immédiate
    });
    console.log(`🔑 Token cleared for user: ${req.user?.email || 'unknown'}`);
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   POST /api/auth/create-staff-admin
// @access  Admin only
exports.createStaffOrAdmin = async (req, res) => {
  try {
    const User = getModel('User');
    const { name, email, password, phone, address, role } = req.body;

    // Validation du rôle
    if (!role || !['staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Le rôle doit être "staff" ou "admin"' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role, phone, address });
    const token = generateToken(user._id);

    // Set token as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   PUT /api/auth/me
exports.updateProfile = async (req, res) => {
  try {
    const User = getModel('User');
    const fieldsToUpdate = ['name', 'phone', 'address', 'profilePicture'];
    const update = {};
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, update);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Re-fetch pour avoir les données à jour
    const updatedUser = await User.findById(req.user._id);
    const doc = updatedUser.toJSON ? updatedUser.toJSON() : (updatedUser._doc || updatedUser);
    const { password, ...userWithoutPassword } = doc;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};