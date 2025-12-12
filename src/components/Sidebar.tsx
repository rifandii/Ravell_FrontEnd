// src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen, // Mengganti List dengan BookOpen untuk kesan 'Articles'
  FolderOpen, // Mengganti Categories
  Hash, // Mengganti Tags
  Archive,
  User, // Mengganti Info
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Terminal // Ikon dekoratif tambahan
} from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface SidebarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isMenuOpen, setIsMenuOpen }: SidebarProps) => {
  const location = useLocation();

  const navItems = [
    { label: "MENU", items: [
      { name: "Home", path: "/", icon: Home },
      { name: "Articles", path: "/articles", icon: BookOpen },
      { name: "Categories", path: "/categories", icon: FolderOpen },
      { name: "Tags", path: "/tags", icon: Hash },
      { name: "Archives", path: "/archives", icon: Archive },
    ]},
    { label: "GENERAL", items: [
      { name: "About Me", path: "/about", icon: User },
    ]}
  ];

  const socialItems = [
    { href: "#", icon: Github, label: "GitHub" },
    { href: "#", icon: Linkedin, label: "LinkedIn" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Instagram, label: "Instagram" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:sticky md:top-0 md:h-screen
        `}
      >
        {/* --- HEADER: Profile & Brand --- */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800/50">
          <div className="flex justify-between items-start md:block">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src="profile.png" // Pastikan path benar
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white leading-tight">
                  Ravell Net
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  Network Engineer
                </p>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* --- NAVIGATION --- */}
        <div className="flex-1 overflow-y-auto py-6 px-4 hide-scrollbar space-y-8">
          {navItems.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">
                {group.label}
              </h3>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${active 
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        }
                      `}
                    >
                      {/* Icon Wrapper */}
                      <span className={`
                        transition-colors duration-200
                        ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}
                      `}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </span>
                      
                      {item.name}

                      {/* Active Indicator Dot (Right aligned) */}
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* --- FOOTER: Socials & Copyright --- */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex justify-center gap-2 mb-4">
            {socialItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm"
                aria-label={item.label}
              >
                <item.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest">
              © 2025 Ravell Networks
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;