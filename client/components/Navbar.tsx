import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';
import { Menu, X, LogOut, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';

export const Navbar = () => {
  // const {  } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet(); //To Disconnect Wallet

  let isConnected = currentAccount?.address;
  let currentUserAddress = currentAccount?.address;

  const disconnectWallet = () => {
    disconnect()
  }


  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore DAOs', path: '/explore-dao' },
    { name: 'My DAOs', path: '/my-daos' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold tracking-tighter text-zinc-50">DAO Vote</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {isConnected && navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-zinc-50 ${isActive(link.path) ? 'text-zinc-50' : 'text-zinc-400'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {currentAccount?.address ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                {currentUserAddress?.slice(0, 6)}...{currentUserAddress?.slice(-4)}
              </div>
              <Button variant="ghost" size="icon" onClick={disconnectWallet} title="Logout">
                <LogOut className="h-5 w-5 text-zinc-400 hover:text-red-400" />
              </Button>
            </div>
          ) : (
            <ConnectModal
              trigger={
                <Button className="gap-2">
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              }
              open={open}
              onOpenChange={(isOpen) => setOpen(isOpen)}
            />

          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-zinc-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 py-4 overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              {isConnected && navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-medium text-zinc-400 hover:text-zinc-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2 border-t border-zinc-800">
                {!isConnected && (
                  <ConnectModal
                    trigger={
                      <Button className="gap-2">
                        <Wallet className="h-4 w-4" />
                        Connect Wallet
                      </Button>
                    }
                    open={open}
                    onOpenChange={(isOpen) => setOpen(isOpen)}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
