// src/pages/TagsPage.tsx
import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPaginatedTags } from '../services/apiClient';
import type { Tag } from '../types/types';
import Skeleton from 'react-loading-skeleton';
import {
  Hash,
  FileText,
  AlertCircle,
  Tag as TagIcon,
  Network,
  Server,
  Fingerprint,
  Shield,
  Radar,
  LineChart,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Flame,
  Binary,
  Cloud,
  Globe,
  Workflow,
  Cable,
  Layers,
  KeyRound,
  Lock
} from 'lucide-react';
import SEO from '../components/SEO';

interface TagTheme {
  icon: React.ReactNode;
  iconBg: string;
  iconText: string;
  cardHoverBorder: string;
  shadowHover: string;
}

const getTagTheme = (tagName: string): TagTheme => {
  const name = tagName.toLowerCase().trim();

  // Theme templates
  const cyanTheme = {
    icon: <Fingerprint className="w-5 h-5 animate-pulse" />,
    iconBg: "bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/50",
    iconText: "text-cyan-600 dark:text-cyan-400",
    cardHoverBorder: "hover:border-cyan-400 dark:hover:border-cyan-600",
    shadowHover: "hover:shadow-cyan-500/10",
  };

  const blueTheme = {
    icon: <Network className="w-5 h-5" />,
    iconBg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50",
    iconText: "text-blue-600 dark:text-blue-400",
    cardHoverBorder: "hover:border-blue-400 dark:hover:border-blue-600",
    shadowHover: "hover:shadow-blue-500/10",
  };

  const greenTheme = {
    icon: <Server className="w-5 h-5" />,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50",
    iconText: "text-emerald-600 dark:text-emerald-400",
    cardHoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-600",
    shadowHover: "hover:shadow-emerald-500/10",
  };

  const purpleTheme = {
    icon: <Radar className="w-5 h-5 animate-spin-slow" />,
    iconBg: "bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50",
    iconText: "text-purple-600 dark:text-purple-400",
    cardHoverBorder: "hover:border-purple-400 dark:hover:border-purple-600",
    shadowHover: "hover:shadow-purple-500/10",
  };

  const amberTheme = {
    icon: <Sliders className="w-5 h-5" />,
    iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50",
    iconText: "text-amber-600 dark:text-amber-400",
    cardHoverBorder: "hover:border-amber-400 dark:hover:border-amber-600",
    shadowHover: "hover:shadow-amber-500/10",
  };

  const violetTheme = {
    icon: <Binary className="w-5 h-5" />,
    iconBg: "bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50",
    iconText: "text-violet-600 dark:text-violet-400",
    cardHoverBorder: "hover:border-violet-400 dark:hover:border-violet-600",
    shadowHover: "hover:shadow-violet-500/10",
  };

  const fuchsiaTheme = {
    icon: <LineChart className="w-5 h-5" />,
    iconBg: "bg-fuchsia-50 dark:bg-fuchsia-950/40 border border-fuchsia-100 dark:border-fuchsia-900/50",
    iconText: "text-fuchsia-600 dark:text-fuchsia-400",
    cardHoverBorder: "hover:border-fuchsia-400 dark:hover:border-fuchsia-600",
    shadowHover: "hover:shadow-fuchsia-500/10",
  };

  const redTheme = {
    icon: <Flame className="w-5 h-5" />,
    iconBg: "bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50",
    iconText: "text-red-600 dark:text-red-400",
    cardHoverBorder: "hover:border-red-400 dark:hover:border-red-600",
    shadowHover: "hover:shadow-red-500/10",
  };

  const roseTheme = {
    icon: <ShieldAlert className="w-5 h-5" />,
    iconBg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50",
    iconText: "text-rose-600 dark:text-rose-400",
    cardHoverBorder: "hover:border-rose-400 dark:hover:border-rose-600",
    shadowHover: "hover:shadow-rose-500/10",
  };

  const orangeTheme = {
    icon: <ShieldCheck className="w-5 h-5" />,
    iconBg: "bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50",
    iconText: "text-orange-600 dark:text-orange-400",
    cardHoverBorder: "hover:border-orange-400 dark:hover:border-orange-600",
    shadowHover: "hover:shadow-orange-500/10",
  };

  const slateTheme = {
    icon: <Cable className="w-5 h-5" />,
    iconBg: "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
    iconText: "text-slate-600 dark:text-slate-400",
    cardHoverBorder: "hover:border-slate-400 dark:hover:border-slate-500",
    shadowHover: "hover:shadow-slate-500/10",
  };

  const indigoTheme = {
    icon: <Workflow className="w-5 h-5" />,
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50",
    iconText: "text-indigo-600 dark:text-indigo-400",
    cardHoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-600",
    shadowHover: "hover:shadow-indigo-500/10",
  };

  // 1. BRAND FIREWALLS
  if (name.includes('palo alto') || name.includes('paloalto') || name.includes('pan-os') || name.includes('panos')) {
    return {
      ...orangeTheme,
      icon: <ShieldCheck className="w-5 h-5 animate-pulse" />
    };
  }
  if (name.includes('fortinet') || name.includes('fortigate') || name.includes('fortios')) {
    return {
      ...redTheme,
      icon: <Shield className="w-5 h-5" />
    };
  }
  if (name.includes('check point') || name.includes('checkpoint')) {
    return {
      ...roseTheme,
      icon: <Lock className="w-5 h-5" />
    };
  }
  if (name.includes('cisco asa') || name.includes('cisco ftd') || name.includes('cisco fmc') || name.includes('firepower')) {
    return {
      ...blueTheme,
      icon: <ShieldAlert className="w-5 h-5" />
    };
  }

  // 2. CLOUD PROVIDERS
  if (name === 'aws' || name.includes('amazon web services')) {
    return {
      ...orangeTheme,
      icon: <Cloud className="w-5 h-5" />
    };
  }
  if (name === 'azure' || name.includes('microsoft azure')) {
    return {
      ...blueTheme,
      icon: <Cloud className="w-5 h-5" />
    };
  }
  if (name === 'gcp' || name.includes('google cloud') || name.includes('google cloud platform')) {
    return {
      ...greenTheme,
      icon: <Cloud className="w-5 h-5" />
    };
  }

  // 3. SDN NETWORKING
  if (name.includes('sd-wan') || name === 'sdwan') {
    return {
      ...violetTheme,
      icon: <Globe className="w-5 h-5" />
    };
  }
  if (name === 'sda' || name.includes('software-defined access') || name.includes('sd-access')) {
    return {
      ...cyanTheme,
      icon: <KeyRound className="w-5 h-5 animate-pulse" />
    };
  }
  if (name === 'aci' || name.includes('application centric infrastructure')) {
    return {
      ...indigoTheme,
      icon: <Layers className="w-5 h-5" />
    };
  }

  // 4. TRADITIONAL/LEGACY NETWORKING
  if (name.includes('traditional') || name.includes('legacy')) {
    return slateTheme;
  }

  // 5. AUTOMATION & SCRIPTING
  if (name.includes('ansible') || name.includes('automation') || name.includes('python') || name.includes('script') || name.includes('terraform') || name.includes('playbook') || name.includes('ci/cd') || name.includes('cicd')) {
    return indigoTheme;
  }

  // 6. ORIGINAL MAPS
  if (name.includes('active directory') || name === 'ad') return cyanTheme;
  if (name.includes('cisco')) return blueTheme;
  if (name.includes('domain controller') || name === 'dc') return greenTheme;
  if (name.includes('extrahop')) return purpleTheme;
  if (name === 'eca') return amberTheme;
  if (name === 'eda') return violetTheme;
  if (name === 'exa') return fuchsiaTheme;
  if (name.includes('firewall')) return redTheme;
  if (name === 'ndr') return roseTheme;
  if (name === 'ngfw') return orangeTheme;

  // Keyword-based general fallbacks
  if (name.includes('security') || name.includes('secure') || name.includes('cyber') || name.includes('protect')) {
    return {
      icon: <Shield className="w-5 h-5" />,
      iconBg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50",
      iconText: "text-rose-600 dark:text-rose-400",
      cardHoverBorder: "hover:border-rose-400 dark:hover:border-rose-600",
      shadowHover: "hover:shadow-rose-500/10",
    };
  }
  if (name.includes('network') || name.includes('route') || name.includes('switch') || name.includes('ip') || name.includes('vpn')) {
    return blueTheme;
  }
  if (name.includes('server') || name.includes('cloud') || name.includes('database') || name.includes('sql') || name.includes('db')) {
    return greenTheme;
  }

  // Default Tag fallback
  return {
    icon: <TagIcon className="w-5 h-5" />,
    iconBg: "bg-purple-50 dark:bg-purple-900/30 border border-purple-100/50 dark:border-purple-800/50",
    iconText: "text-purple-600 dark:text-purple-400",
    cardHoverBorder: "hover:border-purple-400 dark:hover:border-purple-600",
    shadowHover: "hover:shadow-purple-500/10",
  };
};

const TagsPage = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const data = await getPaginatedTags();
        setTags(data.results);
      } catch (err) {
        setError('Unable to load topic tags.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 py-12 animate-in fade-in duration-500">
        {/* Header Skeleton — mirrors actual header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="flex justify-center mb-6">
            <Skeleton width={64} height={64} borderRadius={16} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
          </div>
          <Skeleton width={180} height={36} className="mx-auto mb-3" baseColor="#d3d3d3" highlightColor="#e9e9e9" />
          <Skeleton width={420} height={20} className="mx-auto" baseColor="#d3d3d3" highlightColor="#e9e9e9" />
        </div>

        {/* Tags Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between min-h-[140px]">
                <Skeleton width={40} height={40} borderRadius={8} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                <div>
                  <Skeleton width="60%" height={24} className="mb-2" baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                  <Skeleton width="35%" height={14} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Failed to Load Tags</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 py-12 animate-in fade-in duration-500">
      <SEO
        title="Tags"
        description="Browse articles by specific keywords and technical concepts."
      />

      {/* --- HEADER SECTION --- */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mb-6 shadow-sm hover:rotate-12 transition-transform duration-300">
          <Hash className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          All Topics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Browse articles by specific keywords and technical concepts.
        </p>
      </div>

      {/* --- TAGS GRID --- */}
      <div className="max-w-7xl mx-auto">
        {tags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tags.map(tag => {
              const theme = getTagTheme(tag.name);
              return (
                <Link
                  key={tag.id}
                  to={`/articles?tags__slug=${tag.slug}&tag_name=${tag.name}`}
                  className={`group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl ${theme.shadowHover} ${theme.cardHoverBorder} transition-all duration-300 transform hover:-translate-y-1`}
                >
                  {/* Background Decoration (# Watermark) */}
                  <div className="absolute -right-6 -top-6 text-9xl font-black text-gray-50 dark:text-gray-700/20 opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none select-none font-sans">
                    #
                  </div>

                  <div className="relative z-10 flex flex-col h-full justify-between min-h-[100px]">
                    {/* Top: Icon */}
                    <div className="mb-4">
                      <div className={`w-10 h-10 rounded-lg ${theme.iconBg} ${theme.iconText} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        {theme.icon}
                      </div>
                    </div>

                    {/* Bottom: Content */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {tag.name}
                      </h2>

                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <FileText className="w-3.5 h-3.5" />
                        <span>
                          {tag.post_count} {tag.post_count === 1 ? 'article' : 'articles'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <Hash className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No tags found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsPage;