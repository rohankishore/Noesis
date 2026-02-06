import { useNavigate } from 'react-router-dom';
import CardNav from '@/component/CardNav';

export default function Header() {
  const navigate = useNavigate();
  const navItems = [
    {
      label: 'Mathematics',
      bgColor: 'rgba(102, 126, 234, 0.1)',
      textColor: '#667eea',
      links: [
        { label: 'Calculus', href: '/math', ariaLabel: 'Go to Calculus' },
        { label: 'Algebra', href: '/math', ariaLabel: 'Go to Algebra' },
        { label: 'Geometry', href: '/math', ariaLabel: 'Go to Geometry' }
      ]
    },
    {
      label: 'Physics',
      bgColor: 'rgba(168, 85, 247, 0.1)',
      textColor: '#a855f7',
      links: [
        { label: 'Overview', href: '/physics', ariaLabel: 'Physics Overview' },
        { label: 'Kinematics', href: '/projectile', ariaLabel: 'Go to Projectile Motion' },
        { label: 'Energy', href: '/pendulum', ariaLabel: 'Go to Pendulum Simulator' },
        { label: 'Momentum', href: '/collision', ariaLabel: 'Go to Collision Lab' },
        { label: 'Fluids', href: '/pascals-law', ariaLabel: "Go to Pascal's Law" },
        { label: 'Electromagnetism', href: '/magnetic-field', ariaLabel: 'Go to Magnetic Field' },
        { label: 'Optics', href: '/refraction', ariaLabel: 'Go to Refraction' }
      ]
    },
    {
      label: 'Resources',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      textColor: '#ec4899',
      links: [
        { label: 'Documentation', href: '/documentation', ariaLabel: 'View Documentation' },
        { label: 'Examples', href: '/examples', ariaLabel: 'View Examples' },
        { label: 'About', href: '/about', ariaLabel: 'About Noesis' }
      ]
    }
  ];

  return (
    <header className="fixed w-full top-0 z-50 px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <CardNav
          logoText="Noesis"
          onLogoClick={() => navigate('/')}
          items={navItems}
          baseColor="#121212"
          menuColor="#ffffff"
          buttonBgColor="#667eea"
          buttonTextColor="#ffffff"
        />
      </div>
    </header>
  );
}
