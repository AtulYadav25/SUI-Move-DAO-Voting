import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Users, Plus, MoreHorizontal, UserPlus, Copy, Search, Trash2, Shield, ShieldOff } from 'lucide-react';
import { ProposalCard } from '../components/ProposalCard';
import { Dialog } from '../components/ui/Dialog';
import { Input, Textarea } from '../components/ui/Input';
import { Skeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { truncateAddress } from '../utils';
import { DAOStates, Member } from '../types';
import { useCurrentAccount } from '@mysten/dapp-kit';


export const DaoDetails = () => {
    const { daoId } = useParams<{ daoId: string }>();
    const { daos, joinDao, createProposal, addMember, removeMember, updateMemberRole, connectWallet, fetchDAO } = useApp();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'proposals' | 'members'>('proposals');
    const [isPropDialogOpen, setIsPropDialogOpen] = useState(false);
    const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    //Dapp States
    const account = useCurrentAccount();
    const isConnected = account?.address;

    // New Proposal Form State
    const [pTitle, setPTitle] = useState('');
    const [pDesc, setPDesc] = useState('');

    // New Member ADD Form State
    const [mAddress, setMAddress] = useState('');
    const [mRole, setMRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');

    // Member Actions Dropdown State
    const [activeMenuMember, setActiveMenuMember] = useState<string | null>(null);

    //Current DAO States
    const [dao, setDao] = useState(daos.find(d => d.id === daoId));


    useEffect(() => {
        //Fetch DAO If not found
        if (!dao) {
            fetchDAO(daoId)
        }
    }, [daoId]);



    if (!loading && !dao) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-zinc-100">DAO Not Found</h2>
                <p className="text-zinc-500 mb-6">The DAO you are looking for does not exist.</p>
                <Button onClick={() => navigate('/explore-dao')}>Explore DAOs</Button>
            </div>
        );
    }

    const handleCreateProposal = async () => {
        if (!!isConnected) return toast.error("Please Connect Wallet!");
        if (!pTitle || !pDesc) return toast.error("Fill fields");
        const tid = toast.loading("Creating Proposal...");
        await createProposal(daoId!, pTitle, pDesc);
        toast.dismiss(tid);
        toast.success("Proposal Live!");
        setIsPropDialogOpen(false);
        setPTitle(''); setPDesc('');
    };

    const handleAddMember = async () => {
        if (!isConnected) return connectWallet();
        if (!mAddress) return toast.error("Enter address");
        const tid = toast.loading("Adding Member...");
        await addMember(daoId!, mAddress, mRole);
        toast.dismiss(tid);
        toast.success("Member added");
        setIsMemberDialogOpen(false);
        setMAddress('');
    };

    const handleJoin = async () => {
        if (!isConnected) return toast("Please Connect Wallet!");
        const tid = toast.loading("Joining...");
        await joinDao(daoId!);
        toast.dismiss(tid);
    };

    const handleUpdateRole = async (member: Member) => {
        if (!isConnected) return connectWallet();
        setActiveMenuMember(null);
        const newRole = member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
        const tid = toast.loading(`Updating role to ${newRole}...`);
        await updateMemberRole(daoId!, member.address, newRole);
        toast.dismiss(tid);
        toast.success(`Role updated to ${newRole}`);
    };

    const handleRemoveMember = async (memberAddress: string) => {
        if (!isConnected) return connectWallet();
        setActiveMenuMember(null);
        const tid = toast.loading("Removing member...");
        await removeMember(daoId!, memberAddress);
        toast.dismiss(tid);
        toast.success("Member removed");
    };

    const getUserRole = (address): 'ADMIN' | 'MEMBER' => {
        const member = dao?.daoStates.admins.find(m => m.toLowerCase() === address.toLowerCase());
        return member ? 'ADMIN' : 'MEMBER';
    }


    if (loading) return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-40 w-full mb-8 rounded-xl" />
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen container mx-auto px-4 py-8 pb-20">

            {/* Header Box */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8 backdrop-blur-xl mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-zinc-50 mb-2">{dao?.name}</h1>
                        <p className="text-zinc-400 max-w-2xl">{dao?.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-zinc-300 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                            <Users className="h-5 w-5 text-blue-400" />
                            <span className="font-bold">{dao.daoStates?.members.length || 0}</span>
                            <span className="text-xs text-zinc-500 uppercase">Members</span>
                        </div>
                        <Button onClick={handleJoin}>Join DAO</Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
                        <button
                            onClick={() => setActiveTab('proposals')}
                            className={`px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${activeTab === 'proposals' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'}`}
                        >
                            Proposals
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${activeTab === 'members' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'}`}
                        >
                            Members
                        </button>
                    </div>
                </div>

                <div className="flex-1">
                    {activeTab === 'proposals' ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-heading font-semibold text-zinc-200">Active Proposals</h3>
                                <Button size="sm" onClick={() => setIsPropDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Proposal
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {dao.daoStates.proposals.length > 0 ? (
                                    dao.daoStates.proposals.map(prop => (
                                        <ProposalCard key={prop.id} proposal={prop} daoId={dao!.id} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                                        No proposals yet. Be the first to create one!
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-heading font-semibold text-zinc-200">DAO Members</h3>
                                <Button size="sm" onClick={() => setIsMemberDialogOpen(true)} variant="secondary">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Member
                                </Button>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-900/50 text-zinc-400">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Member</th>
                                            <th className="px-6 py-4 font-medium">Role</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {dao.daoStates.members.map((member, idx) => (
                                            <tr key={idx} className="hover:bg-zinc-900/40 relative">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                                            {member[2]}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-zinc-200">
                                                            {truncateAddress(member)}
                                                            <Copy className="h-3 w-3 text-zinc-600 cursor-pointer hover:text-zinc-400" onClick={() => { navigator.clipboard.writeText(member); toast.success("Copied"); }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserRole(member) === 'ADMIN' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getUserRole(member) === 'ADMIN' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                                                        {getUserRole(member)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="relative inline-block text-left">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); setActiveMenuMember(activeMenuMember === member ? null : member); }}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                                                        </Button>

                                                        {activeMenuMember === member && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenuMember(null)}></div>
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    className="absolute right-0 top-8 z-20 mt-1 w-48 rounded-md border border-zinc-700 bg-zinc-950 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none"
                                                                >
                                                                    <div className="py-1">
                                                                        <button
                                                                            onClick={() => handleUpdateRole(member)}
                                                                            className="flex w-full items-center px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                                                                        >
                                                                            {member.role === 'ADMIN' ? (
                                                                                <>
                                                                                    <ShieldOff className="mr-2 h-4 w-4" /> Demote to Member
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Shield className="mr-2 h-4 w-4" /> Promote to Admin
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRemoveMember(member.address)}
                                                                            className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300"
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" /> Remove Member
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <Dialog isOpen={isPropDialogOpen} onClose={() => setIsPropDialogOpen(false)} title="Create Proposal">
                <div className="space-y-4 mt-4">
                    <Input placeholder="Proposal Title" value={pTitle} onChange={(e) => setPTitle(e.target.value)} />
                    <Textarea placeholder="Details..." value={pDesc} onChange={(e) => setPDesc(e.target.value)} />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsPropDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateProposal}>Create</Button>
                    </div>
                </div>
            </Dialog>

            <Dialog isOpen={isMemberDialogOpen} onClose={() => setIsMemberDialogOpen(false)} title="Add New Member">
                <div className="space-y-4 mt-4">
                    <Input placeholder="Wallet Address (0x...)" value={mAddress} onChange={(e) => setMAddress(e.target.value)} />
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="role" checked={mRole === 'MEMBER'} onChange={() => setMRole('MEMBER')} className="accent-blue-500" />
                            <span className="text-sm text-zinc-300">Member</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="role" checked={mRole === 'ADMIN'} onChange={() => setMRole('ADMIN')} className="accent-blue-500" />
                            <span className="text-sm text-zinc-300">Admin</span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsMemberDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddMember}>Add Member</Button>
                    </div>
                </div>
            </Dialog>

        </div>
    );
};