import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login(email, password);
      toast.success('Connexion réussie');
      // Rediriger selon le rôle
      if (data.role === 'client') {
        navigate('/client-dashboard');
      } else if (data.role === 'staff') {
        navigate('/staff-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch {
      // Erreur déjà gérée par l'intercepteur axios
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header minimal */}
      <header className="px-6 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-gray-900">
          Waste<span className="font-light">Manager</span>
        </Link>
      </header>

      {/* Contenu centré */}
      <div className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-gray-400 font-light">
              Connectez-vous à votre compte
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label-xai">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-xai"
                placeholder="exemple@email.com"
              />
            </div>

            <div>
              <label className="label-xai">Mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-xai"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-400">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-gray-900 font-medium hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}