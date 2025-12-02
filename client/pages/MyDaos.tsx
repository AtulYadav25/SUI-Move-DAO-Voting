import React from 'react';
import { useApp } from '../context/AppContext';
import { DaoCard } from '../components/DaoCard';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';

export const MyDaos = () => {
   const { daos, currentUserAddress, connectWallet } = useApp();
   const navigate = useNavigate();

   const account = useCurrentAccount();
   const isConnected = account?.address;
   // Filter DAOs where current user is owner OR member
   const myDaos = isConnected
      ? daos.filter(d => d.daoStates.members.some(m => m === account?.address))
      : [];

   if (!isConnected) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold text-zinc-100 mb-4">Connect Wallet</h2>
            <p className="text-zinc-500 mb-6">You need to connect your wallet to view your DAOs.</p>
            <Button onClick={connectWallet}>Connect Now</Button>
         </div>
      );
   }

   return (
      <div className="min-h-screen container mx-auto px-4 py-8 pb-20">
         <h1 className="text-3xl font-heading font-bold text-zinc-50 mb-8">My DAOs</h1>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {myDaos.length > 0 ? (
               myDaos.map(dao => <DaoCard key={dao.id} dao={dao} />)
            ) : (
               <div className="col-span-full py-16 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10">
                  <p className="text-zinc-400 mb-4">You haven't joined or created any DAOs yet.</p>
                  <Button variant="outline" onClick={() => navigate('/')}>Create or Join DAO</Button>
               </div>
            )}
         </div>
      </div>
   );
};
