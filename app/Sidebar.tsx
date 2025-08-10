import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaQuestionCircle, FaChartBar } from 'react-icons/fa';
import './globals.css';

export default function Sidebar() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const iconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    margin: '0 auto',
    borderRadius: '12px',
    background: 'none',
    color: 'inherit',
    transition: 'background 0.15s',
    fontSize: 0,
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    position: 'relative',
  };
  const activeStyle = {
    background: '#2d3748',
    color: '#4fd1c5',
  };
  const sidebarStyle = {
    width: '64px',
    background: '#181d26',
    color: 'white',
    height: '100vh',
    paddingTop: '2rem',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '2px 0 8px rgba(0,0,0,0.07)',
    zIndex: 100,
  };
  return (
    <aside style={sidebarStyle as React.CSSProperties}>
      <Link href="/" legacyBehavior>
        <a
          style={{
            ...iconStyle,
            ...(pathname === '/' ? activeStyle : {}),
          } as React.CSSProperties}
          title="Homepage"
        >
          <FaHome size={24} />
        </a>
      </Link>
      <Link href="/analytics" legacyBehavior>
        <a
          style={{
            ...iconStyle,
            ...(pathname === '/analytics' ? activeStyle : {}),
          } as React.CSSProperties}
          title="Analytics"
        >
          <FaChartBar size={24} />
        </a>
      </Link>
      <Link href="/enquiry" legacyBehavior>
        <a
          style={{
            ...iconStyle,
            ...(pathname === '/enquiry' ? activeStyle : {}),
          } as React.CSSProperties}
          title="Enquiry"
        >
          <FaQuestionCircle size={24} />
        </a>
      </Link>
    </aside>
  );
}
