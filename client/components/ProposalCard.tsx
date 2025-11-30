import React, { useState } from 'react';
import { Proposal } from '../types';
import { Button } from './ui/Button';
import { Copy, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, truncateAddress } from '../utils';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

interface ProposalCardProps {
  proposal: Proposal;
  daoId: string;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, daoId }) => {
  const { voteProposal } = useApp();
  const [voting, setVoting] = useState(false);

  // Calculate percentages
  const totalVotes = proposal.yes + proposal.no;
  const yesPercent = totalVotes === 0 ? 0 : (proposal.yes / totalVotes) * 100;
  const noPercent = totalVotes === 0 ? 0 : (proposal.no / totalVotes) * 100;

  const handleVote = async (type: 'yes' | 'no') => {
    if (voting) return;
    if (proposal.userVote) {
       toast.error("You have already voted!");
       return;
    }
    setVoting(true);
    await voteProposal(daoId, proposal.id, type);
    toast.success("Voted successfully!", { duration: 2000 });
    setVoting(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(proposal.creator);
    toast.success("Address copied");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row gap-6 w-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 backdrop-blur-sm"
    >
      {/* Left Content */}
      <div className="flex-1 flex flex-col gap-2">
         <h3 className="font-heading text-lg font-medium text-zinc-100">{proposal.title}</h3>
         <p className="text-sm text-zinc-400">{proposal.description}</p>
         
         <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <span>Created By:</span>
            <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
               {truncateAddress(proposal.creator)}
               <button onClick={copyAddress} className="hover:text-zinc-300">
                  <Copy className="h-3 w-3" />
               </button>
            </div>
            {proposal.isClosed && <span className="text-red-400 ml-2 font-medium">Closed</span>}
         </div>
      </div>

      {/* Right Voting Section */}
      <div className="md:w-1/3 flex flex-col justify-center gap-4">
         <div className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Cast your Vote</div>
         
         <div className="flex gap-3">
            <Button 
               onClick={() => handleVote('yes')}
               disabled={proposal.isClosed || voting}
               className={cn(
                 "flex-1 border-green-900 text-green-500 hover:bg-green-900/20",
                 proposal.userVote === 'yes' ? "bg-green-600 text-white hover:bg-green-700 border-transparent" : "bg-transparent border"
               )}
            >
               Yes
            </Button>
            <Button 
               onClick={() => handleVote('no')}
               disabled={proposal.isClosed || voting}
               className={cn(
                 "flex-1 border-red-900 text-red-500 hover:bg-red-900/20",
                 proposal.userVote === 'no' ? "bg-red-600 text-white hover:bg-red-700 border-transparent" : "bg-transparent border"
               )}
            >
               No
            </Button>
         </div>

         {/* Progress Bar */}
         <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800 mt-1">
             <div className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500" style={{ width: `${yesPercent}%` }} />
             {/* To keep it simple visually, just showing yes bar growing, remainder is No implicitly or we can stack them */}
         </div>
         <div className="flex justify-between text-xs text-zinc-500 px-1">
            <span className="text-green-400">{proposal.yes} Votes ({yesPercent.toFixed(0)}%)</span>
            <span className="text-red-400">{proposal.no} Votes ({noPercent.toFixed(0)}%)</span>
         </div>
      </div>
    </motion.div>
  );
};
