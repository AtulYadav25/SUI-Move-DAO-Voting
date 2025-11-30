import React, { useState } from 'react';
import { Dialog } from './ui/Dialog';
import { Input, Textarea } from './ui/Input';
import { Button } from './ui/Button';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDaoDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const { createDao } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !desc) {
        toast.error("Please fill all fields");
        return;
    }
    setLoading(true);
    const toastId = toast.loading("Creating DAO...");
    
    try {
        const newId = await createDao(title, desc);
        toast.dismiss(toastId);
        
        // Custom success toast with button
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-zinc-900 border border-zinc-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-zinc-100">
                    DAO Created Successfully
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                    {title} is now live.
                    </p>
                </div>
                </div>
            </div>
            <div className="flex border-l border-zinc-800">
                <button
                onClick={() => {
                    toast.dismiss(t.id);
                    onClose();
                    navigate(`/dao/${newId}`);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                Open
                </button>
            </div>
            </div>
        ), { duration: 5000 });

        setTitle('');
        setDesc('');
        onClose();
    } catch (e) {
        toast.error("Failed to create DAO");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create Your Own DAO" 
      description="You can add your members, create proposals and allow them to vote."
    >
      <div className="flex flex-col gap-4 mt-2">
         <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">DAO Title</label>
            <Input 
                placeholder="Ex. Super Team DAO" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
            />
         </div>
         <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Description</label>
            <Textarea 
                placeholder="Describe the purpose of this DAO..." 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)}
            />
         </div>
         <div className="flex justify-end gap-2 mt-2">
             <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
             <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create DAO'}
             </Button>
         </div>
      </div>
    </Dialog>
  );
};
