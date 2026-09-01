import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Calendar, DollarSign, Sparkles, ArrowRight, FlaskConical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80'
];

export default function LandingPage() {
  const { loginWithGoogle } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [devLoading, setDevLoading] = useState(false);
  const [devError, setDevError] = useState(null);
  const [devTokenInput, setDevTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setEmailError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: isRegistering ? 'register' : 'login' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      
      localStorage.setItem('tripai_token', data.token);
      window.location.href = '/';
    } catch (err) {
      setEmailError(err.message);
    }
  };

  const isDev = process.env.NODE_ENV === 'development';

  // Try to read ?dev_login=... from the URL on first mount and sign in
  // automatically. Lets the user bookmark:
  //   https://<frontend>/?dev_login=<token>
  // and the page signs them in without any further interaction.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('dev_login');
    if (urlToken) {
      // Clean the URL so the token doesn't linger in browser history.
      window.history.replaceState({}, '', window.location.pathname);
      devSignIn(urlToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const devSignIn = async (token) => {
    setDevLoading(true);
    setDevError(null);
    try {
      const url = token
        ? `${API_BASE}/auth/dev-login?token=${encodeURIComponent(token)}`
        : `${API_BASE}/auth/dev-login`;
      const res = await fetch(url, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      localStorage.setItem('tripai_token', data.token);
      // Reload so AuthProvider picks up the token and the rest of the app mounts.
      window.location.href = '/';
    } catch (err) {
      setDevError(err.message);
      setDevLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((i) => (i + 1) % UNSPLASH_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: MapPin,
      title: 'Real Places',
      description: 'Every location is verified with real coordinates from OpenStreetMap.'
    },
    {
      icon: Calendar,
      title: 'Day-by-Day',
      description: 'Detailed hourly schedules with transport times between activities.'
    },
    {
      icon: DollarSign,
      title: 'Cost Breakdown',
      description: 'Per-person costs with a running total against your budget.'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'Personalized recommendations based on your interests and travel style.'
    }
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative min-h-screen min-h-[650px] overflow-hidden flex flex-col">
        {/* Background images with crossfade */}
        {UNSPLASH_IMAGES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === currentImage ? 1 : 0 }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-ink/60" />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <Compass size={28} className="text-terra" strokeWidth={1.5} />
              <span className="font-serif text-2xl text-cream tracking-tight">Trip.AI</span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95] mb-6 tracking-tight">
              Plan your next<br />adventure
            </h1>

            <p className="text-cream/70 text-base md:text-lg max-w-lg mb-10 leading-relaxed">
              AI-crafted itineraries with real places, costs, and routes. 
              Tell us where you want to go — we handle the details.
            </p>

            <div className="flex flex-col gap-4 max-w-sm">
              <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 bg-ink/40 border border-cream/30 text-cream placeholder:text-cream/50 outline-none focus:border-cream/70 text-sm"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-4 py-3 bg-ink/40 border border-cream/30 text-cream placeholder:text-cream/50 outline-none focus:border-cream/70 text-sm"
                  required
                />
                {emailError && <p className="text-red-400 text-xs">{emailError}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    onClick={() => setIsRegistering(false)}
                    className="flex-1 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] bg-cream text-ink hover:bg-cream-dark transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    type="submit"
                    onClick={() => setIsRegistering(true)}
                    className="flex-1 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] border border-cream/30 text-cream hover:bg-cream/10 transition-colors"
                  >
                    Register
                  </button>
                </div>
              </form>
              <div className="flex items-center gap-4 my-1">
                <div className="flex-1 border-t border-cream/20"></div>
                <span className="text-[10px] uppercase tracking-[0.14em] text-cream/40">OR</span>
                <div className="flex-1 border-t border-cream/20"></div>
              </div>
              <button
                onClick={loginWithGoogle}
                className="flex items-center justify-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] border border-cream/30 text-cream hover:bg-cream/10 transition-colors"
              >
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-cream/20">
              {isDev ? (
                <button
                  onClick={() => devSignIn()}
                  disabled={devLoading}
                  className="flex items-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] border border-cream/40 text-cream/80 hover:text-cream hover:border-cream/70 transition-colors disabled:opacity-50"
                >
                  <FlaskConical size={13} strokeWidth={1.5} />
                  {devLoading ? 'Signing in...' : 'Dev Sign-in (local only)'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowTokenInput((s) => !s)}
                    disabled={devLoading}
                    className="flex items-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] border border-cream/40 text-cream/80 hover:text-cream hover:border-cream/70 transition-colors disabled:opacity-50"
                  >
                    <FlaskConical size={13} strokeWidth={1.5} />
                    {showTokenInput ? 'Hide dev sign-in' : 'Dev sign-in (token)'}
                  </button>
                  {showTokenInput && (
                    <form
                      onSubmit={(e) => { e.preventDefault(); devSignIn(devTokenInput); }}
                      className="mt-3 flex gap-2"
                    >
                      <input
                        type="password"
                        value={devTokenInput}
                        onChange={(e) => setDevTokenInput(e.target.value)}
                        placeholder="Paste DEV_LOGIN_TOKEN..."
                        className="flex-1 px-3 py-2 bg-cream/10 border border-cream/30 text-cream placeholder-cream/40 text-xs focus:outline-none focus:border-cream"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={devLoading || !devTokenInput}
                        className="px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] bg-cream text-ink hover:bg-cream/80 transition-colors disabled:opacity-50"
                      >
                        {devLoading ? 'Signing in...' : 'Sign in'}
                      </button>
                    </form>
                  )}
                </>
              )}
              {devError && (
                <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-terra">
                  {devError}
                </p>
              )}
              <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-cream/40">
                {isDev
                  ? 'Local development only — no token required'
                  : 'Set DEV_LOGIN_TOKEN on the worker, then paste it above. Or use ?dev_login=<token> in the URL.'}
              </p>
            </div>
          </div>
        </div>

        {/* Image dots indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {UNSPLASH_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`w-8 h-[2px] transition-colors ${
                i === currentImage ? 'bg-terra' : 'bg-cream/30'
              }`}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-6 md:right-12 lg:right-20 z-10">
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-cream/50 hover:text-cream transition-colors"
          >
            Learn more
            <ArrowRight size={12} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t border-rule">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-rule">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`py-10 px-6 ${i > 0 ? 'md:border-l border-rule' : ''}`}
                >
                  <Icon size={20} className="text-terra mb-4" strokeWidth={1.5} />
                  <h3 className="font-serif text-lg text-ink mb-2">{feature.title}</h3>
                  <p className="text-sm text-ink-light leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rule py-8 px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass size={14} className="text-ink-muted" strokeWidth={1.5} />
            <span className="font-serif text-sm text-ink">Trip.AI</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            Free forever. No credit card required.
          </p>
        </div>
      </footer>
    </div>
  );
}
