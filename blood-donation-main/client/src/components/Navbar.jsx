import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { HeartHandshake, Menu, X } from 'lucide-react';

const links = [
  ['Home', '/'], ['Find Donors', '/search'], ['Blood Requests', '/requests'],
  ['Donor Map', '/map'], ['Contact', '/contact']
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const active = (path) => location.pathname === path;
  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Main navigation">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark"><HeartHandshake size={21} /></span>
          <span>Blood<span>Connect</span></span>
        </Link>
        <div className="desktop-links">
          {links.map(([label, path]) => <NavLink key={path} to={path} end={path === '/'} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{label}</NavLink>)}
        </div>
        <div className="nav-actions">
          <Link className="nav-need" to="/requests">Need Blood</Link>
          <Link className="nav-donate" to="/register">Donate Blood</Link>
        </div>
        <button className="mobile-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open && <div className="mobile-menu">{links.map(([label,path]) => <Link key={path} to={path} onClick={() => setOpen(false)} className={active(path) ? 'active' : ''}>{label}</Link>)}<Link to="/register" className="mobile-cta" onClick={() => setOpen(false)}>Become a donor</Link></div>}
    </header>
  );
}
