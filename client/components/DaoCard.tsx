import React from 'react';
import { DAO } from '../types';
import { Users, Copy, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface DaoCardProps {
  dao: DAO;
}

export const DaoCard: React.FC<DaoCardProps> = ({ dao }) => {
  const navigate = useNavigate();
  const { addMember } = useApp();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(dao.id);
    toast.success("DAO ID copied", { id: 'copy-toast', icon: <Copy className="h-4 w-4 text-zinc-900" /> });
  };

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addMember(dao.id);
  }

  return (
    <motion.div 
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-6 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-900/60 hover:shadow-lg hover:shadow-black/50"
    >
      <div className="mb-4">
        <div className="flex items-start justify-between">
           <h3 className="font-heading text-lg font-semibold text-zinc-50 line-clamp-1" title={dao.title}>
              {dao.title}
           </h3>
           <div className="flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
              <Users className="h-3 w-3" />
              <span>{dao.daoStates.members?.length || 0}</span>
           </div>
        </div>
        <p className="mt-2 text-sm text-zinc-400 line-clamp-2 min-h-[40px]">
           {dao.description}
        </p>
      </div>

      <div className="mt-auto space-y-4">
         <div 
           onClick={handleCopy}
           className="flex w-fit cursor-pointer items-center gap-2 rounded-md bg-zinc-950/50 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
         >
            <span>DAO_ID: {dao.id.slice(0, 6)}...{dao.id.slice(-4)}</span>
            <Copy className="h-3 w-3" />
         </div>

         <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" size="sm" className="w-full" onClick={handleJoin}>
               Join
            </Button>
            <Button variant="outline" size="sm" className="w-full gap-1 group-hover:bg-zinc-100 group-hover:text-zinc-900 transition-all" onClick={(e) => {e.preventDefault(); navigate(`/dao/${dao.id}`)}}>
               View
               <ArrowRight className="h-3 w-3" />
            </Button>
         </div>
      </div>
    </motion.div>
  );
};