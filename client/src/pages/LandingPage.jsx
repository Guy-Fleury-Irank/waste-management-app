import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  const sections = [
    {
      id: 'sites',
      title: 'Gérez vos sites de collecte',
      desc: 'Une vue centralisée de tous vos sites. Suivez les opérations, les volumes traités et les équipes sur le terrain en temps réel, depuis un tableau de bord unique.',
      image: '/src/images/site.jpg',
      imageLeft: false,
    },
    {
      id: 'vehicules',
      title: 'Flotte connectée et optimisée',
      desc: 'Pilotez votre flotte de véhicules avec une précision chirurgicale. Planification des tournées, suivi carburant, maintenance préventive — tout est automatisé.',
      image: '/src/images/vehicle.jpg',
      imageLeft: true,
    },
    {
      id: 'collectes',
      title: 'Collectes en temps réel',
      desc: 'Suivez chaque collecte de bout en bout. De l\'assignation au dépôt final, chaque étape est horodatée et géolocalisée pour une transparence totale.',
      image: '/src/images/collecte.jpg',
      imageLeft: false,
    },
    {
      id: 'recyclage',
      title: 'Recyclage & valorisation',
      desc: 'Maximisez le taux de valorisation de vos déchets. Notre plateforme vous aide à identifier les filières de recyclage adaptées à chaque type de déchet.',
      image: '/src/images/electronics.jpg',
      imageLeft: true,
    },
    {
      id: 'dechets',
      title: 'Tableau de bord analytique',
      desc: 'Visualisez vos indicateurs clés : volumes collectés, taux de recyclage, coûts opérationnels. Des graphiques clairs pour des décisions éclairées.',
      image: '/src/images/dumps.jpg',
      imageLeft: false,
    },
  ];

  const words = ["réinventée.", "écologique.", "optimisée.", "intelligente.", "durable."];
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState(words[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    if (!isDeleting && displayedText === currentWord) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const speed = isDeleting ? 50 : 80;
    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayedText(currentWord.substring(0, displayedText.length - 1));
      } else {
        setDisplayedText(currentWord.substring(0, displayedText.length + 1));
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, wordIndex]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}.cursor-blink{animation:blink 1s step-end infinite}`}</style>
      {/* ============ HEADER ============ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold tracking-[0.03em] text-foreground">
            Waste<span className="font-light">Manager</span>
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                to={user.role === 'client' ? '/client-dashboard' : user.role === 'staff' ? '/staff-dashboard' : '/dashboard'}
                className="px-4 py-2 border border-border bg-surface text-sm font-medium tracking-[0.01em] text-foreground hover:border-strong transition-colors"
              >
                Tableau de bord
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted hover:text-strong transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="px-4 py-2 border border-border bg-surface text-sm font-medium tracking-[0.01em] text-foreground hover:border-strong transition-colors">
                  S'inscrire
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Brutalisme Technique</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.05] max-w-4xl mx-auto">
            La gestion des déchets<br />
            <span className="inline-block min-w-[180px] text-left text-muted">
              {displayedText}
              <span className="cursor-blink ml-0.5 font-light">|</span>
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            Une plateforme tout-en-un pour piloter vos collectes, suivre vos sites,
            gérer votre flotte et optimiser votre impact environnemental.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2">
              Commencer maintenant
              <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </Link>
            <Link to="/login" className="px-8 py-3.5 border border-border text-muted text-sm font-medium rounded-full hover:border-strong hover:text-strong transition-colors inline-flex items-center gap-2">
              Voir la démo
              <span className="font-mono text-muted">[done]</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ Z-PATTERN SECTIONS ============ */}
      {sections.map((section, idx) => (
        <section key={section.id} className={`py-20 md:py-28 px-6 ${idx % 2 === 0 ? 'bg-background' : 'bg-surface'}`}>
          <div className="max-w-7xl mx-auto">
            <div className={`flex flex-col ${section.imageLeft ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-20`}>
              <div className="flex-1 max-w-lg">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{section.id}</span>
                <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight">{section.title}</h2>
                <p className="mt-5 text-base text-muted-strong font-light leading-relaxed">{section.desc}</p>
                <Link to="/register" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-0.5 hover:border-strong transition-colors">
                  En savoir plus
                  <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </Link>
              </div>
              <div className="flex-1 w-full">
                <div className="relative overflow-hidden bg-surface border border-border">
                  <img src={section.image} alt={section.title} className="w-full h-72 md:h-96 object-cover mask-fade-bottom transition-transform duration-500 group-hover:scale-105" loading={idx < 2 ? 'eager' : 'lazy'} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ============ PLANS D'ABONNEMENT ============ */}
      <section className="py-20 md:py-28 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Tarifs</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-foreground tracking-tight">Choisissez votre plan</h2>
            <p className="mt-4 text-base text-muted-strong font-light max-w-xl mx-auto">
              Des offres adaptées à vos besoins. Particulier ou organisation, nous avons le plan qu'il vous faut.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white border border-gray-100 p-8 hover:border-gray-300 transition-all">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Hebdomadaire</p>
              <p className="mt-4 text-4xl font-bold tracking-tight text-gray-900">25 <span className="text-base font-normal text-gray-400">USD/sem</span></p>
              <p className="mt-2 text-sm text-gray-400 font-light">Idéal pour les petits besoins ponctuels</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm text-muted"><ChevronRight className="w-3.5 h-3.5 stroke-[1.5] text-muted" />Collecte hebdomadaire</li>
                <li className="flex items-center gap-2 text-sm text-muted"><ChevronRight className="w-3.5 h-3.5 stroke-[1.5] text-muted" />1 site inclus</li>
              </ul>
              <Link to="/register" className="mt-8 block w-full py-3 text-center border border-gray-200 text-sm font-medium rounded-full text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all">Commencer</Link>
            </div>
            <div className="rounded-2xl bg-gray-900 text-white p-8 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium rounded-full bg-white text-gray-900">Populaire</span>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Mensuel</p>
              <p className="mt-4 text-4xl font-bold tracking-tight">80 <span className="text-base font-normal text-gray-400">USD/mois</span></p>
              <p className="mt-2 text-sm text-gray-400 font-light">Le meilleur rapport qualité-prix</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-300"><ChevronRight className="w-3.5 h-3.5 stroke-[1.5] text-gray-300" />Collecte mensuelle</li>
                <li className="flex items-center gap-2 text-sm text-gray-300"><ChevronRight className="w-3.5 h-3.5 stroke-[1.5] text-gray-300" />3 sites inclus</li>
                <li className="flex items-center gap-2 text-sm text-gray-300"><ChevronRight className="w-3.5 h-3.5 stroke-[1.5] text-gray-300" />Support prioritaire</li>
              </ul>
              <Link to="/register" className="mt-8 block w-full py-3 text-center bg-white text-gray-900 text-sm font-medium rounded-full hover:bg-gray-100 transition-all">Commencer</Link>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-8 hover:border-gray-300 transition-all">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Annuel</p>
              <p className="mt-4 text-4xl font-bold tracking-tight text-gray-900">800 <span className="text-base font-normal text-gray-400">USD/an</span></p>
              <p className="mt-2 text-sm text-gray-400 font-light">Économisez 17% par rapport au mensuel</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm text-muted"><ChevronRight className="w-3.5 h-3.5 stroke-[1.5] text-muted" />Collecte illimitée</li>
                <li className="flex items-center gap-2 text-sm text-muted"><ChevronRight className="w-3.5 h-3.5 stroke-[1.5] text-muted" />Sites illimités</li>
                <li className="flex items-center gap-2 text-sm text-muted"><ChevronRight className="w-3.5 h-3.5 stroke-[1.5] text-muted" />Support dédié</li>
              </ul>
              <Link to="/register" className="mt-8 block w-full py-3 text-center border border-gray-200 text-sm font-medium rounded-full text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all">Commencer</Link>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-gray-400 font-light">
            +30% pour les organisations · Paiement par carte, PayPal, Lumicash ou dépôt au siège
          </p>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="py-28 px-6 bg-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Prêt à révolutionner la gestion<br />de vos déchets ?
          </h2>
          <p className="mt-6 text-lg text-muted font-light max-w-xl mx-auto">
            Rejoignez les entreprises qui optimisent déjà leur chaîne de traitement des déchets avec WasteManager.
          </p>
          <div className="mt-10">
            <Link to="/register" className="px-8 py-3.5 bg-white text-gray-900 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
              Créer un compte gratuit
              <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-16 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">À propos</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-gray-400 hover:text-gray-700 cursor-pointer transition-colors">Notre mission</span></li>
                <li><span className="text-sm text-gray-400 hover:text-gray-700 cursor-pointer transition-colors">L'équipe</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Services</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-gray-400 hover:text-gray-700 cursor-pointer transition-colors">Collecte</span></li>
                <li><span className="text-sm text-gray-400 hover:text-gray-700 cursor-pointer transition-colors">Recyclage</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-gray-400">contact@wastemanager.com</span></li>
                <li><span className="text-sm text-gray-400">+243 800 000 000</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Légal</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-gray-400">Mentions légales</span></li>
                <li><span className="text-sm text-gray-400">Confidentialité</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-400 font-light">&copy; {new Date().getFullYear()} WasteManager. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}