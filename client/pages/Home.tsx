import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DaoCard } from '../components/DaoCard';
import { CreateDaoDialog } from '../components/CreateDaoDialog';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

export const Home = () => {
  const navigate = useNavigate();
  const { daos, loading } = useApp();
  const [showCreateDialog, setShowCreateDialog] = useState(false);


  const handleCreateClick = () => {
      setShowCreateDialog(true);
  }

  return (
    <div className="min-h-screen pb-20">
       <CreateDaoDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} />
       
       {/* Hero */}
       <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.zinc.800),theme(colors.zinc.950))] opacity-20" />
          <div className="container mx-auto px-4 text-center">
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="font-heading text-4xl font-bold tracking-tight text-zinc-50 sm:text-6xl"
             >
                Secure SUI Blockchain Voting
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="mt-6 text-lg leading-8 text-zinc-400 max-w-2xl mx-auto"
             >
                Empower your community with decentralized governance. Create organizations, propose initiatives, and vote transparently.
             </motion.p>
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="mt-10 flex items-center justify-center gap-6"
             >
                <Button size="lg" onClick={handleCreateClick} className="gap-2">
                   <Plus className="h-4 w-4" />
                   Create DAO
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/explore-dao')} className="gap-2">
                   Explore DAOs
                   <ArrowRight className="h-4 w-4" />
                </Button>
             </motion.div>
          </div>
       </section>

       {/* DAO Grid */}
       <section className="container mx-auto px-4">
          <h2 className="text-2xl font-heading font-semibold text-zinc-100 mb-8">Featured DAOs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {loading ? (
                Array(4).fill(null).map((_, i) => (
                    <div key={i} className="h-[300px] w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
                        <Skeleton className="h-6 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6 mb-8" />
                        <div className="mt-auto space-y-4 pt-10">
                            <Skeleton className="h-6 w-1/2" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </div>
                ))
             ) : (
                daos.length > 0 ? (
                    daos.slice(0, 8).map(dao => <DaoCard key={dao.id} dao={dao} />)
                ) : (
                    <div className="col-span-full py-20 text-center text-zinc-500">
                        No DAOs Available
                    </div>
                )
             )}
          </div>
       </section>
    </div>
  );
};
