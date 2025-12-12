import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Instagram } from 'lucide-react';

// Komponen SocialLink Kustom untuk merapikan kode
const SocialLink: React.FC<{
  href: string;
  label: string;
  icon: React.ElementType;
}> = ({ href, label, icon: Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-gray-500 dark:text-gray-400 transition-colors duration-200
               hover:text-blue-600 dark:hover:text-blue-400"
  >
    <Icon className="w-6 h-6" />
  </a>
);

const Footer = () => {
  // Data untuk link agar mudah di-update
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
    { name: "Categories", path: "/categories" },
    { name: "About", path: "/about" },
    { name: "Archives", path: "/archives" },
  ];

  const socialLinks = [
    { label: "GitHub", href: "#", icon: Github }, // Ganti '#' dengan link Anda
    { label: "LinkedIn", href: "#", icon: Linkedin },
    { label: "Twitter", href: "#", icon: Twitter },
    { label: "Instagram", href: "#", icon: Instagram },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-4">
      {/* Container utama dengan padding dan max-width */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Grid 3-kolom untuk konten utama footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Kolom 1: Tentang Blog */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Ravell Networks
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Blog pribadi yang didedikasikan untuk berbagi artikel, tutorial, dan wawasan mendalam tentang jaringan dan keamanan.
            </p>
          </div>

          {/* Kolom 2: Quick Links */}
          <div className="space-y-4 md:mx-auto">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 
                               hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Sosial Media */}
          <div className="space-y-4 md:mx-auto">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Follow Me
            </h4>
            <div className="flex space-x-5">
              {socialLinks.map(social => (
                <SocialLink
                  key={social.label}
                  href={social.href}
                  label={social.label}
                  icon={social.icon}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Garis Pemisah & Copyright */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            © {new Date().getFullYear()} Ravell Networks. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;