'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  BookOpen,
  FolderOpen,
  Hash,
  Archive,
  Terminal
} from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface SidebarProps {
  isMenuOpen: boolean;
  isMobile: boolean;
  onClose: (restoreFocus?: boolean) => void;
  onNavigate: () => void;
}

const SidebarNext = ({ isMenuOpen, isMobile, onClose, onNavigate }: SidebarProps) => {
  const pathname = usePathname();

  const navItems = [
    { label: "MENU", items: [
      { name: "Home", path: "/", icon: Home },
      { name: "Articles", path: "/articles", icon: BookOpen },
      { name: "Categories", path: "/categories", icon: FolderOpen },
      { name: "Tags", path: "/tags", icon: Hash },
      { name: "Archives", path: "/archives", icon: Archive },
    ]}
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <>
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden"
          onClick={() => onClose()}
        />
      )}

      <aside
        id="primary-navigation"
        aria-label="Primary navigation"
        inert={isMobile && !isMenuOpen}
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:sticky md:top-0 md:h-screen
        `}
      >
        <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-400">
                <Image
                  src="/ravell-core-navbar.png"
                  alt="Ravell"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                  priority
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 dark:text-white leading-none truncate">
                Ravell
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-0.5 mt-0.5">
                <Terminal className="w-2.5 h-2.5" />
                IT Guy.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose(true)}
            className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close navigation menu"
          >
            <XMarkIcon className="w-5 h-5" aria-hidden="true" focusable="false" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 hide-scrollbar space-y-8">
          {navItems.map((group, groupIndex) => (
            <div key={groupIndex}>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                {group.label}
              </p>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={onNavigate}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${active
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        }
                      `}
                    >
                      <span className={`
                        transition-colors duration-200
                        ${active ? "text-purple-600 dark:text-purple-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}
                      `}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </span>

                      {item.name}

                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full"></span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="text-center">
            <p className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-widest">
              © 2025 Ravell Networks
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarNext;
