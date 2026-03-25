import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-12 bg-white/50 backdrop-blur-sm border-t border-slate-100">
      <div className="max-container flex flex-col items-center justify-center gap-6">
        <Link 
          href="https://gradskills.in" 
          target="_blank" 
          className="group flex flex-col items-center gap-4 hover:scale-105 transition-all duration-300"
        >
          <img 
            src="https://image2url.com/r2/default/images/1772362953079-6c29c142-3343-457e-aa4f-e62893004fd6.png" 
            alt="GradSkills" 
            className="h-10 w-auto object-contain"
          />
          <span className="text-gray-400 font-medium text-sm tracking-widest uppercase">
            Built by GradSkills
          </span>
        </Link>
        
        <div className="text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em]">
          © {currentYear} ALL RIGHTS RESERVED
        </div>
      </div>
    </footer>
  );
}
