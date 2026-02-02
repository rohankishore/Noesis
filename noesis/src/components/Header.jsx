import { Link } from 'react-router-dom';
import CardNav from '@/component/CardNav';

export default function Header() {
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
        { label: 'Mechanics', href: '/physics', ariaLabel: 'Go to Mechanics' },
        { label: 'Kinematics', href: '/physics', ariaLabel: 'Go to Kinematics' },
        { label: 'Projectile', href: '/projectile', ariaLabel: 'Go to Projectile Motion' }
      ]
    },
    {
      label: 'Resources',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      textColor: '#ec4899',
      links: [
        { label: 'Documentation', href: '#', ariaLabel: 'View Documentation' },
        { label: 'Examples', href: '#', ariaLabel: 'View Examples' },
        { label: 'About', href: '#', ariaLabel: 'About Noesis' }
      ]
    }
  ];

  return (
    <header className="fixed w-full top-0 z-50 px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <CardNav
          logoText="Noesis"
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
