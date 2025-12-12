// src/pages/AboutPage.tsx
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Network,
  ShieldCheck,
  Award,
  Server,
  Terminal,
  Cpu
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Background Pattern (Konsisten dengan Home) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] opacity-25"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-900"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl">
        
        {/* --- HEADER SECTION --- */}
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Architecting Secure <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Digital Infrastructures</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Hi, I'm the human behind <span className="font-semibold text-gray-900 dark:text-gray-200">Ravell Networks</span>. 
            I bridge the gap between complex network engineering and modern cybersecurity practices.
          </p>
        </div>

        {/* --- BENTO GRID LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. PROFILE CARD (Span 2 columns on mobile, 1 on desktop) */}
          <div className="md:col-span-1 row-span-2 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center text-center">
            <div className="relative w-40 h-40 mb-6 group">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <img
                src="public/profile.png" // Pastikan path ini benar
                alt="Ravell Networks"
                className="relative w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-700 shadow-xl"
              />
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full" title="Online"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Ravell Networks</h2>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-6">NetSec Engineer</p>
            
            <div className="w-full space-y-3">
               {[
                { icon: Github, label: 'Github', href: '#' },
                { icon: Linkedin, label: 'LinkedIn', href: '#' },
                { icon: Twitter, label: 'Twitter', href: '#' },
               ].map((social) => (
                 <a 
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium border border-gray-100 dark:border-gray-700"
                 >
                   <social.icon className="w-4 h-4" />
                   {social.label}
                 </a>
               ))}
            </div>
          </div>

          {/* 2. TECH STACK (Wide Card) */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Server className="w-32 h-32 rotate-12 translate-x-8 -translate-y-8" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                Technical Arsenal
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-400 mb-3 font-medium uppercase tracking-wider">Vendors & Ecosystem</p>
                  <div className="flex flex-wrap gap-2">
                    {['Cisco', 'Fortinet', 'Palo Alto', 'Check Point', 'Juniper'].map(tech => (
                      <span key={tech} className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-sm backdrop-blur-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-slate-400 mb-3 font-medium uppercase tracking-wider">Tools & Automation</p>
                  <div className="flex flex-wrap gap-2">
                    {['Python', 'Ansible', 'Wireshark', 'GNS3', 'EVE-NG', 'Linux'].map(tech => (
                      <span key={tech} className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-200 text-sm backdrop-blur-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. CORE FOCUS: Engineering */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Network className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Network Engineering</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Designing robust topologies (Spine-Leaf, Core-Dist-Access) and managing enterprise-grade routing & switching protocols.
            </p>
          </div>

          {/* 4. CORE FOCUS: Security */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Cybersecurity</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Implementing Zero Trust architecture, configuring NGFW policies, and hardening infrastructure against modern threats.
            </p>
          </div>

          {/* 5. CERTIFICATIONS (Wide Card) */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Certifications & Milestones
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Certificate Item: Active */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
                  <span className="text-xs font-bold text-gray-500">NSE</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Fortinet NSE 4</h4>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Active
                  </span>
                </div>
              </div>

              {/* Certificate Item: Pending */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 opacity-75">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
                  <span className="text-xs font-bold text-gray-500">CCNP</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Cisco Enterprise</h4>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                    In Progress
                  </span>
                </div>
              </div>

               {/* Certificate Item: Pending */}
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 opacity-75">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
                  <span className="text-[10px] font-bold text-gray-500">PCNSA</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Palo Alto PCNSA</h4>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                    In Progress
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. GITHUB / CODE (Tall Card) */}
          <div className="md:col-span-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between">
             <div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <Terminal className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Code & Labs</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Check out my automation scripts and EVE-NG topologies.
                </p>
             </div>
             
             <div className="bg-black/30 rounded-xl p-3 font-mono text-xs text-green-400 mb-4">
               $ git clone ravell-net<br/>
               $ cd automation<br/>
               $ python deploy.py
             </div>

             <a href="#" className="w-full py-2 bg-white text-gray-900 rounded-lg text-center text-sm font-bold hover:bg-gray-100 transition-colors">
               Visit GitHub
             </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutPage;