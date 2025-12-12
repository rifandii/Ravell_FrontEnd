// src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen, // Mengganti List dengan BookOpen untuk kesan 'Articles'
  FolderOpen, // Mengganti Categories
  Hash, // Mengganti Tags
  Archive,
  /*
  User,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  */
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
    /*
    { label: "GENERAL", items: [
      { name: "About Me", path: "/about", icon: User },
    ]}
     */ 
  ];
  /* 
  const socialItems = [
    { href: "#", icon: Github, label: "GitHub" },
    { href: "#", icon: Linkedin, label: "LinkedIn" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Instagram, label: "Instagram" },
  ];
  */

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
                    src="data:image/png;base64,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" // Pastikan path benar
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white leading-tight">
                  Ravell
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  IT Guy.
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
            {/*
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
            */}
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