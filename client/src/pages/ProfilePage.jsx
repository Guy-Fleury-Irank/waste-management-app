import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePictureChange = (base64) => {
    try {
      setProfilePicture(base64);
    } catch (error) {
      console.error('❌ Erreur handlePictureChange :', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (profilePicture !== undefined) {
        payload.profilePicture = profilePicture;
      }
      const { data } = await api.put('/auth/me', payload);
      updateUser(data);
      toast.success('Profil mis à jour');
    } catch { /* handled */ }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-8">Mon profil</h1>

      {/* Carte infos */}
      <div className="bg-surface border border-border rounded-sm p-6 mb-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Rôle</p>
            <p className="text-sm font-medium text-foreground capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Membre depuis</p>
            <p className="text-sm font-medium text-foreground">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Photo de profil */}
      <div className="bg-surface border border-border rounded-sm p-6 mb-8">
        <h2 className="text-base font-medium text-foreground mb-5">Photo de profil</h2>
        <ProfilePictureUpload
          currentPicture={profilePicture}
          onPictureChange={handlePictureChange}
          userName={user?.name || 'User'}
        />
      </div>

      {/* Formulaire */}
      <div className="bg-surface border border-border rounded-sm p-6">
        <h2 className="text-base font-medium text-foreground mb-5">Modifier mes informations</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-xai">Nom complet</label>
            <input name="name" required value={form.name} onChange={handleChange}
              className="input-xai" placeholder="Votre nom" />
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
            className="px-6 py-2.5 bg-foreground text-white text-sm font-medium rounded-sm hover:bg-strong disabled:opacity-50 transition-colors">
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
}