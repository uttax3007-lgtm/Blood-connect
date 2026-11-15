import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, MapPin, ShieldCheck, Users, Droplet, Clock3, HandHeart } from 'lucide-react';

type Donor = { bloodGroup?: string; availability?: string };
type RequestItem = { status?: string };

export default function LandingPage() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState<number | null>(null);
  const [requests, setRequests] = useState<number | null>(null);
  const [fulfilled, setFulfilled] = useState<number | null>(null);
  const api = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    let live = true;
    Promise.all([
      axios.get<Donor[]>(`${api}/api/donors`).catch(() => null),
      axios.get<RequestItem[]>(`${api}/api/requests`, { params: { status: 'open' } }).catch(() => null),
      axios.get<RequestItem[]>(`${api}/api/requests`, { params: { status: 'fulfilled' } }).catch(() => null)
    ]).then(([d, r, f]) => {
      if (!live) return;
      if (d && Array.isArray(d.data)) setDonors(d.data.length);
      if (r && Array.isArray(r.data)) setRequests(r.data.length);
      if (f && Array.isArray(f.data)) setFulfilled(f.data.length);
    });
    return () => { live = false; };
  }, [api]);

  return <main>
    <section className="hero">
      <div className="hero-shade" />
      <div className="hero-content">
        <div className="eyebrow"><span /> COMMUNITY BLOOD DONATION NETWORK</div>
        <h1>Every drop counts.<br /><em>Every donor matters.</em></h1>
        <p>Connecting people who can give with people who need it. A little kindness can make the difference between waiting and hope.</p>
        <div className="hero-actions">
          <Link to="/search" className="button button-primary">Find a donor <ArrowRight size={17}/></Link>
          <Link to="/register" className="button button-outline">Become a donor</Link>
        </div>
        <div className="hero-trust"><span><ShieldCheck size={16}/> Community-powered</span><span><Heart size={16}/> Every contribution matters</span></div>
      </div>
      <div className="hero-caption">GIVE THE GIFT OF LIFE <span>01 / 03</span></div>
    </section>

    <section className="feature-overlap" aria-label="Quick actions">
      <button className="feature-card feature-donate" onClick={() => navigate('/register')}>
        <span className="feature-label">MAKE A DIFFERENCE</span><strong>Donate blood.<br/>Save a life.</strong><span className="feature-link">Register as a donor <ArrowRight size={16}/></span>
      </button>
      <button className="feature-card feature-request" onClick={() => navigate('/requests')}>
        <span className="feature-label">WHEN EVERY SECOND MATTERS</span><strong>Looking for<br/>blood support?</strong><span className="feature-link">Explore blood requests <ArrowRight size={16}/></span>
      </button>
    </section>

    <section className="impact-section section-wrap">
      <div className="section-heading"><div><span className="kicker">OUR COMMUNITY</span><h2>Small acts. <em>Lasting impact.</em></h2></div><p>Real numbers from the BloodConnect community. Data appears when the platform's API is available.</p></div>
      <div className="impact-grid">
        <div className="impact-item"><Users/><strong>{donors === null ? '—' : donors.toLocaleString('en-IN')}</strong><span>Registered donors</span></div>
        <div className="impact-item"><Droplet/><strong>{requests === null ? '—' : requests.toLocaleString('en-IN')}</strong><span>Open blood requests</span></div>
        <div className="impact-item"><Heart/><strong>{fulfilled === null ? '—' : fulfilled.toLocaleString('en-IN')}</strong><span>Fulfilled requests</span></div>
        <div className="impact-item"><MapPin/><strong>—</strong><span>Cities covered</span></div>
      </div>
    </section>

    <section className="how-section"><div className="section-wrap"><div className="section-heading"><div><span className="kicker">SIMPLE. HUMAN. CONNECTED.</span><h2>Help is closer <em>than you think.</em></h2></div></div><div className="steps-grid">
      <article><span className="step-no">01</span><HandHeart/><h3>Join the community</h3><p>Register your blood group and share when you are available to help.</p></article>
      <article><span className="step-no">02</span><Droplet/><h3>Find a match</h3><p>Search community donor listings or browse current blood requests.</p></article>
      <article><span className="step-no">03</span><Heart/><h3>Connect & help</h3><p>Contact donors or requesters directly and coordinate next steps.</p></article>
    </div></div></section>

    <section className="closing-cta section-wrap"><div><span className="kicker">BE SOMEONE'S REASON TO HOPE</span><h2>Your time can make<br/><em>someone's tomorrow.</em></h2></div><Link to="/register" className="button button-primary">Join BloodConnect <ArrowRight size={17}/></Link></section>
    <footer className="site-footer"><div className="footer-inner"><Link to="/" className="brand footer-brand"><span className="brand-mark"><Heart size={19}/></span><span>Blood<span>Connect</span></span></Link><p>A community-driven blood donation and emergency response platform.</p><div className="footer-links"><Link to="/search">Find donors</Link><Link to="/requests">Blood requests</Link><Link to="/map">Donor map</Link><Link to="/contact">Contact</Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} BloodConnect</span><span>Developed by <strong>Sir Utkarsh J.</strong></span></div></footer>
  </main>;
}
