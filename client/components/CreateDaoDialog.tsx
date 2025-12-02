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
    
    try {
        await createDao(title, desc);
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
