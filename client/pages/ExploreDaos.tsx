import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search } from 'lucide-react';
import { DaoCard } from '../components/DaoCard';
import { Skeleton } from '../components/Skeleton';

export const ExploreDaos = () => {
  const { daos } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDaos, setFilteredDaos] = useState(daos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = daos.filter(d => 
        d.id.toLowerCase().includes(term) || 
        d.title.toLowerCase().includes(term)
    );
    setFilteredDaos(results);
  }, [searchTerm, daos]);

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 pb-20">
       <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-heading font-bold text-zinc-50">Explore DAOs</h1>
          <div className="flex w-full md:w-auto gap-2">
             <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                <Input 
                   placeholder="Enter DAO ID or Name" 
                   className="pl-9 bg-zinc-900 border-zinc-800"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Button variant="secondary">Search</Button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
             Array(8).fill(null).map((_, i) => (
                <div key={i} className="h-[300px] rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
             ))
          ) : (
             filteredDaos.length > 0 ? (
                 filteredDaos.map(dao => <DaoCard key={dao.id} dao={dao} />)
             ) : (
                 <div className="col-span-full text-center py-20 text-zinc-500 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
                    <p>No DAOs found matching your search.</p>
                 </div>
             )
          )}
       </div>
    </div>
  );
};
