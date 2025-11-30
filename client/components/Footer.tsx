import React from 'react';
import { Twitter, Linkedin, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 py-8 mt-auto">
       <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 font-sans">
             Created By Atul - 2025
          </p>
          <div className="flex items-center gap-6">
             <a href="https://x.com/atulcode" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-100 transition-colors">
                <Twitter className="h-5 w-5" />
             </a>
             <a href="https://www.linkedin.com/in/atulyadav25" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-100 transition-colors">
                <Linkedin className="h-5 w-5" />
             </a>
             <a href="https://github.com/AtulYadav25" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-100 transition-colors">
                <Github className="h-5 w-5" />
             </a>
          </div>
       </div>
    </footer>
  );
};
