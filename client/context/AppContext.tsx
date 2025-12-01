import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DAO, Proposal, Member } from '../types';
import { INITIAL_DAOS, DAO_LIST_ID, SMART_CONTRACT } from '../constants';
import { mockDelay, generateId } from '../utils';
import toast from 'react-hot-toast';
import { use } from 'framer-motion/client';
import { DAO_Object, DAOFields, DAOListFields, isMoveObject } from '../MoveObjectTypes.ts';

//MYSTEN SUI IMPORTS
import { useCurrentAccount } from '@mysten/dapp-kit';
import client from '../suiClient.ts';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

interface AppContextType {
  currentUserAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  daos: DAO[];
  createDao: (name: string, description: string) => Promise<string>;
  joinDao: (daoId: string) => Promise<void>;
  createProposal: (daoId: string, title: string, description: string) => Promise<void>;
  voteProposal: (daoId: string, proposalId: string, vote: 'yes' | 'no') => Promise<void>;
  addMember: (daoId: string, address: string, role: 'ADMIN' | 'MEMBER') => Promise<void>;
  removeMember: (daoId: string, address: string) => Promise<void>;
  updateMemberRole: (daoId: string, address: string, role: 'ADMIN' | 'MEMBER') => Promise<void>;
  fetchTableObject: (tableId: string) => Promise<void>;
  fetchDAO: (daoIds: string[]) => Promise<DAO[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MOCK_USER_ADDRESS = "0x71C...9A23";


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const account = useCurrentAccount();
  const [daos, setDaos] = useState<DAO[]>([]);

  //SUI Query Functions
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();


  //Function to get Initial DAOs from Blockchain using the DaoList Object
  useEffect(() => {
    const fetchDaoList = async () => {
      try {
        const fetchedDaoList = await client.getObject({
          id: DAO_LIST_ID,
          options: { showContent: true },
        });

        const content = fetchedDaoList.data?.content;

        if (!isMoveObject<DAOListFields>(content)) {
          throw new Error("Invalid DAO list object");
        }

        fetchInitialDaos(content.fields.dao_list);

      } catch (error) {
        console.error("Error fetching DAO List:", error);
      }
    };

    const fetchInitialDaos = async (daoList: string[]) => {
      if (daoList.length === 0) return;

      const txns = await client.multiGetObjects({
        ids: daoList,
        options: { showContent: true },
      });

      const fetchedDaos: DAO[] = [];

      for (const txn of txns) {
        const content = txn.data?.content;

        if (!isMoveObject<DAOFields>(content)) {
          console.warn("Skipping invalid DAO object:", txn);
          continue;
        }

        let fields: DAOFields = content.fields;

        let admins = await fetchTableObject(fields.admins.fields.id.id);
        let members = await fetchTableObject(fields.members.fields.id.id);
        let proposals = await fetchTableObject(fields.proposals.fields.id.id);
        // Transform Move object fields to DAO type
        const dao = {
          id: fields.id.id,
          title: fields.name,
          description: fields.description,
          daoStates: {
            admins,
            members,
            proposals,
          }
        };

        fetchedDaos.push(dao);
      }

      setDaos(fetchedDaos);
    };


    fetchDaoList();
  }, []);


  //Fetch DAO from Blockchain and push to dao state 
  const fetchDAO = async (daoId: string) => {
    try {
      const txn = await client.getObject({
        id: daoId,
        options: { showContent: true },
      });

      const content = txn.data?.content;

      if (!isMoveObject<DAOFields>(content)) {
        console.warn("Invalid DAO object:", txn);
        return null;
      }

      const fields = content.fields;

      // 2. Fetch dynamic table data (admins, members, proposals)
      const admins = await fetchTableObject(fields.admins.fields.id.id);
      const members = await fetchTableObject(fields.members.fields.id.id);
      const proposals = await fetchTableObject(fields.proposals.fields.id.id);

      // 3. Transform into DAO model
      const dao: DAO = {
        id: fields.id.id,
        title: fields.name,
        description: fields.description,
        daoStates: {
          admins,
          members,
          proposals,
        }
      };

      // push or update the DAO inside state
      setDaos((prevDaos) => {
        const index = prevDaos.findIndex((d) => d.id === dao.id);

        // If not found → push new
        if (index === -1) {
          return [...prevDaos, dao];
        }

        // If found → update
        const updated = [...prevDaos];
        updated[index] = dao;
        return updated;
      });

    } catch (error) {
      console.error("Error fetching DAO:", error);
    }
  };


  //Fetch DAO from Blockchain and push to dao state 
  const fetchTableObject = async (tableId: string): Promise<string[]> => {
    try {
      const txn = await client.getDynamicFields({
        parentId: tableId,
      });

      // txn.data = array of dynamic field objects
      const addresses = txn.data.map(item => item.name.value as string);


      return addresses;   // <-- array of address strings
    } catch (error) {
      console.error("Error fetching table:", error);
      return [];
    }
  };




  const createDao = async (name: string, description: string) => {
    // fetch shared object info
    const daoListObj = await client.getObject({
      id: DAO_LIST_ID,
      options: { showOwner: true },
    });

    const sharedOwner = (daoListObj.data!.owner as any).Shared;

    const tx = new Transaction();

    tx.moveCall({
      target: `${SMART_CONTRACT}::dao::create_dao`,
      arguments: [
        tx.sharedObjectRef({
          objectId: DAO_LIST_ID,
          initialSharedVersion: sharedOwner.initial_shared_version,
          mutable: true,
        }),
        tx.pure.string(name),
        tx.pure.string(description),
      ],
    });

    const result = await signAndExecuteTransaction({ transaction: tx },
        {
          onSuccess: () => {
            toast.success("Created DAO successfully!");
          },
        },);

  };


  const joinDao = async (daoId: string) => {
    try {
      // 1. Fetch DAO object to get shared owner + version
      const daoObj = await client.getObject({
        id: daoId,
        options: { showOwner: true },
      });

      const sharedOwner = (daoObj.data!.owner as any).Shared;

      // 2. Create transaction
      const tx = new Transaction();

      tx.moveCall({
        target: `${SMART_CONTRACT}::dao::join_dao`,
        arguments: [
          tx.sharedObjectRef({
            objectId: daoId,
            initialSharedVersion: sharedOwner.initial_shared_version,
            mutable: true,
          }),
        ],
      });

      // 3. Sign and execute
      const result = await signAndExecuteTransaction(
        { 
          transaction: tx
        },
        {
          onSuccess: () => {
            toast.success("Joined DAO successfully!");
          },
        },
      )

    } catch (err) {
      console.error("join_dao error:", err);
      toast.error("Failed to join DAO");
    }
  };


  const createProposal = async (daoId: string, title: string, description: string) => {
    await mockDelay(1500);
    const newProp: Proposal = {
      id: generateId('prop_'),
      title,
      description,
      creator: MOCK_USER_ADDRESS,
      yes: 0,
      no: 0,
      deadline: Date.now() + 604800000, // 1 week
      isClosed: false
    };
    setDaos(prev => prev.map(d => {
      if (d.id === daoId) {
        return { ...d, proposals: [newProp, ...d.proposals] };
      }
      return d;
    }));
  }

  const voteProposal = async (daoId: string, proposalId: string, vote: 'yes' | 'no') => {
    await mockDelay(500);
    setDaos(prev => prev.map(d => {
      if (d.id === daoId) {
        const updatedProps = d.proposals.map(p => {
          if (p.id === proposalId) {
            // Simple toggle logic for demo
            // If changing vote, mock decrement old, increment new
            // For simplicity, just increment
            const newYes = vote === 'yes' ? p.yes + 1 : p.yes;
            const newNo = vote === 'no' ? p.no + 1 : p.no;
            return { ...p, yes: newYes, no: newNo, userVote: vote };
          }
          return p;
        });
        return { ...d, proposals: updatedProps };
      }
      return d;
    }));
  }

  const addMember = async (daoId: string, address: string, role: 'ADMIN' | 'MEMBER') => {
    await mockDelay(800);
    setDaos(prev => prev.map(d => {
      if (d.id === daoId) {
        if (d.members.find(m => m.address === address)) return d;
        return {
          ...d,
          members: [...d.members, { address, role }]
        };
      }
      return d;
    }));
  }

  const removeMember = async (daoId: string, address: string) => {
    await mockDelay(500);
    setDaos(prev => prev.map(d => {
      if (d.id === daoId) {
        return { ...d, members: d.members.filter(m => m.address !== address) };
      }
      return d;
    }));
  }

  const updateMemberRole = async (daoId: string, address: string, role: 'ADMIN' | 'MEMBER') => {
    await mockDelay(500);
    setDaos(prev => prev.map(d => {
      if (d.id === daoId) {
        return { ...d, members: d.members.map(m => m.address === address ? { ...m, role } : m) };
      }
      return d;
    }));
  };

  /**
  * Fetches DAOs by ID.
  * 1. Checks which DAO IDs already exist in local state and removes them.
  * 2. Queries the blockchain only for the missing DAO IDs.
  * 3. Returns the combined list (local + remote).
  */
  const fetchDAOs = async (daoIds: string[]) => {
    // await mockDelay(500);

    // Separate DAO IDs that already exist in state and those that don't.
    const existingDaos = [];
    const missingDaoIds: string[] = [];

    for (const id of daoIds) {
      const localDao = daos.find(d => d.id === id);
      if (localDao) {
        existingDaos.push(localDao);
      } else {
        missingDaoIds.push(id);
      }
    }

    // If everything is already in state, return early.
    if (missingDaoIds.length === 0) {
      return existingDaos;
    }

    // Fetch missing DAOs from blockchain.
    const txns = await client.multiGetObjects({
      ids: missingDaoIds,
      options: { showType: true }, // only fetch type to reduce payload
    });

    // You can transform or validate `txns` if needed here.
    const blockchainDaos = txns.map(t => t.data); // example

    return [...existingDaos, ...blockchainDaos];
  };



  return (
    <AppContext.Provider value={{
      daos,
      createDao,
      joinDao,
      createProposal,
      voteProposal,
      addMember,
      removeMember,
      updateMemberRole,
      fetchDAO,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};