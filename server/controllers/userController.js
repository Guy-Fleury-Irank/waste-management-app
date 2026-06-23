const { getModel } = require('../utils/adapter');
const bcrypt = require('bcryptjs');

// @route   GET /api/users
// @access  Admin only
exports.getUsers = async (req, res) => {
  try {
    const User = getModel('User');
    let filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const users = await User.find(filter);
    // Remove passwords from response (plain objects to avoid adapter wrapper)
    const safeUsers = users.map(u => {
      const doc = u.toJSON ? u.toJSON() : (u._doc || u);
      const { password, ...rest } = doc;
      return rest;
    });
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   GET /api/users/:id
// @access  Admin only
exports.getUser = async (req, res) => {
  try {
    const User = getModel('User');
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    const doc = user.toJSON ? user.toJSON() : (user._doc || user);
    const { password, ...userWithoutPassword } = doc;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   POST /api/users
// @access  Admin only
exports.createUser = async (req, res) => {
  try {
    const User = getModel('User');
    const { name, email, password, role, phone, address } = req.body;

    // Validation du rôle
    if (!role || !['client', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Le rôle doit être "client", "staff" ou "admin"' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role || 'client', phone, address });
    const doc = user.toJSON ? user.toJSON() : (user._doc || user);
    const { password: _, ...userWithoutPassword } = doc;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   PUT /api/users/:id
// @access  Admin only
exports.updateUser = async (req, res) => {
  try {
    const User = getModel('User');
    const update = {};
    const fieldsToUpdate = ['name', 'email', 'phone', 'address', 'role', 'isActive'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    // Si un nouveau mot de passe est fourni, le hasher
    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      update.password = await bcrypt.hash(req.body.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, update);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const updatedUser = await User.findById(req.params.id);
    const doc = updatedUser.toJSON ? updatedUser.toJSON() : (updatedUser._doc || updatedUser);
    const { password, ...userWithoutPassword } = doc;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @route   DELETE /api/users/:id
// @access  Admin only
exports.deleteUser = async (req, res) => {
  try {
    const User = getModel('User');
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};