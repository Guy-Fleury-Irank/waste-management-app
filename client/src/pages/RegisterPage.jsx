import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await register(form);
      toast.success('Inscription réussie');
      if (data.role === 'client') {
        navigate('/client-dashboard');
      } else if (data.role === 'staff') {
        navigate('/staff-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch {
      // Erreur déjà gérée
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
              Créer un compte
            </h1>
            <p className="mt-2 text-sm text-gray-400 font-light">
              Rejoignez WasteManager dès aujourd'hui
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-xai">Nom complet</label>
              <input name="name" required value={form.name} onChange={handleChange}
                className="input-xai" placeholder="Jean Dupont" />
            </div>

            <div>
              <label className="label-xai">Email</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                className="input-xai" placeholder="exemple@email.com" />
            </div>

            <div>
              <label className="label-xai">Mot de passe</label>
              <input name="password" type="password" required minLength={6} value={form.password} onChange={handleChange}
                className="input-xai" placeholder="Au moins 6 caractères" />
            </div>

            <div>
              <label className="label-xai">Téléphone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="input-xai" placeholder="+243 800 000 000" />
            </div>

            <div>
              <label className="label-xai">Adresse</label>
              <input name="address" value={form.address} onChange={handleChange}
                className="input-xai" placeholder="Votre adresse" />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 transition-all mt-2">
              {submitting ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-400">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-gray-900 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}