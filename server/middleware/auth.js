const jwt = require('jsonwebtoken');

// Middleware pour protéger les routes (nécessite token)
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback: check HTTP-only cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé - Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Utiliser l'adaptateur pour trouver l'utilisateur
    const { getModel } = require('../utils/adapter');
    const User = getModel('User');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }
    
    // Retirer le password de la réponse — pattern sûr pour Mongoose ET NeDB proxies
    const userObject = user.toJSON ? user.toJSON() : (user._doc || user);
    const { password, ...userWithoutPassword } = userObject;
    
    // Construire explicitement req.user avec tous les champs (évite undefined avec NeDB)
    req.user = {
      _id: userWithoutPassword._id,
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
      phone: userWithoutPassword.phone,
      address: userWithoutPassword.address,
      isActive: userWithoutPassword.isActive
    };

    if (req.user.isActive === false) {
      return res.status(401).json({ message: 'Utilisateur désactivé ou introuvable' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

// Middleware pour restreindre par rôle
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Rôle ${req.user.role} non autorisé` });
    }
    next();
  };
};

// Générer un token JWT
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};