import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DAO, Proposal, Member } from '../types';
import { DAO_LIST_ID, SMART_CONTRACT } from '../constants';
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
  addMember: (daoId: string) => Promise<void>;
  createProposal: (daoId: string, title: string, description: string) => Promise<void>;
  voteProposal: (daoId: string, proposalId: string, vote: 'yes' | 'no') => Promise<void>;
  removeMember: (daoId: string, address: string) => Promise<void>;
  addAdmin: (daoId: string, address: string, role: 'ADMIN' | 'MEMBER') => Promise<void>;
  fetchTableObject: (tableId: string) => Promise<void>;
  fetchDAO: (daoIds: string[]) => Promise<DAO[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const account = useCurrentAccount();
  const [daos, setDaos] = useState<DAO[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  //Loading For Initial
  const [loading, setLoading] = useState<boolean>(true);

  //SUI Query Functions
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();


  //Function to get Initial DAOs from Blockchain using the DaoList Object
  useEffect(() => {
    setLoading(true);
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
        let proposalsId = await fetchTableObject(fields.proposals.fields.id.id);
        let proposals = await fetchProposalObjects(proposalsId);
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


    fetchDaoList().finally(() => {
      setLoading(false);
    });
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
      let proposalsId = await fetchTableObject(fields.proposals.fields.id.id);
      let proposals = await fetchProposalObjects(proposalsId);

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
      toast.error("DAO Not Found!");
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

  const fetchProposalObjects = async (
    proposalIds: string[]
  ): Promise<Proposal[]> => {
    try {
      const txn = await client.multiGetObjects({
        ids: proposalIds,
        options: { showContent: true },
      });

      // Map → async → return array of Promises
      const proposalPromises = txn
        .filter(obj => obj.data?.content?.dataType === "moveObject")
        .map(async obj => {
          const content = obj.data!.content as any;
          const f = content.fields;

          // Fetch dynamic table (async)
          const voters = await fetchTableObject(f.voters.fields.id.id);

          return {
            id: f.id.id,
            title: f.title,
            description: f.description,
            creator: f.creator,
            yes: Number(f.yes_votes),
            no: Number(f.no_votes),
            deadline: Number(f.deadline),
            isClosed: f.is_closed,
            voters,
          } as Proposal;
        });

      // Wait for all async proposals to finish
      const proposals = await Promise.all(proposalPromises);

      return proposals;
    } catch (error) {
      console.error("Error fetching proposal objects:", error);
      return [];
    }
  };








  const createDao = async (name: string, description: string) => {
    const tid = toast.loading(`Creating Your DAO...`);
    try {
      // fetch shared object info
      setLoading(true);
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
            toast.dismiss(tid);
            toast.success("Created DAO successfully!");
            setLoading(false);
            //Refresh Page
            window.location.reload();
          },
          onError: () => {
            toast.dismiss(tid);
            toast.error("Transaction Failed!");
            setLoading(false);
          }
        },);

    } catch (error) {
      toast.dismiss(tid);
      console.error("create_dao error:", error);
      toast.error("Failed to create DAO");
      setLoading(false);
    }
  };


  const addMember = async (daoId: string, address: string = account?.address) => {
    //Check if already a member
    const dao = daos.find(d => d.id === daoId);
    if (dao && dao.daoStates.members.includes(address)) {
      toast.error("You are already a member of this DAO");
      setLoading(false);
      return;
    }

    const tid = toast.loading(`Adding in DAO...`);
    try {

      //Fetch DAO object to get shared owner + version
      const daoObj = await client.getObject({
        id: daoId,
        options: { showOwner: true },
      });

      const sharedOwner = (daoObj.data!.owner as any).Shared;

      // 2. Create transaction
      const tx = new Transaction();

      tx.moveCall({
        target: `${SMART_CONTRACT}::dao::add_member`,
        arguments: [
          tx.sharedObjectRef({
            objectId: daoId,
            initialSharedVersion: sharedOwner.initial_shared_version,
            mutable: true,
          }),
          tx.pure.address(address),
        ],
      });

      // 3. Sign and execute
      const result = await signAndExecuteTransaction(
        {
          transaction: tx
        },
        {
          onSuccess: () => {
            toast.dismiss(tid);
            toast.success("Added to DAO successfully!");
            fetchDAO(daoId); //Refresh DAO Data
          },
          onError: () => {
            toast.dismiss(tid);
            toast.error("Transaction Failed!");

          }
        },
      )

    } catch (err) {
      toast.dismiss(tid);
      console.error("Add_member error:", err);
      toast.error("Failed to Add in DAO");

    }
  };


  const createProposal = async (
    daoId: string,
    title: string,
    description: string,
    deadline: number
  ) => {
    if (!checkMemberShip(daoId)) return;
    const tid = toast.loading(`Publishing your Proposal...`);
    try {
      // 1. Fetch DAO shared object
      const daoObj = await client.getObject({
        id: daoId,
        options: { showOwner: true },
      });

      const sharedOwner = (daoObj.data!.owner as any).Shared;

      // 2. Fetch DAOCap from wallet
      const ADMIN_CAP_TYPE = import.meta.env.VITE_ADMIN_CAP_TYPE;

      const adminCapObjs = await client.getOwnedObjects({
        owner: account?.address,
        options: { showOwner: true, showContent: true },
      });

      // Type-safe filter
      const adminCap = adminCapObjs.data.find((o) => {
        const content = o.data?.content;
        if (!content || content.dataType !== "moveObject" || content.type !== ADMIN_CAP_TYPE) return false;

        const fields = (content as any).fields; // cast to any to access properties safely
        return fields.dao_id === daoId;
      });

      if (!adminCap) {
        toast.dismiss(tid);
        toast.error("No DAOCap found for this wallet");
        setLoading(false);
        return;
      }

      // Extract admin cap object ID
      const adminCapId = (adminCap.data!.content as any).fields.id.id;

      // 3. Create transaction
      const tx = new Transaction();

      // DAO shared ref
      const daoShared = tx.sharedObjectRef({
        objectId: daoId,
        initialSharedVersion: sharedOwner.initial_shared_version,
        mutable: true,
      });

      // AdminCap is an owned object
      const adminCapArg = tx.object(adminCapId);

      if (!deadline || isNaN(Number(deadline))) {
        throw new Error("Deadline must be a valid number");
      }


      // Move Call
      tx.moveCall({
        target: `${SMART_CONTRACT}::proposal::create_proposal`,
        arguments: [
          daoShared,
          tx.pure.string(title),
          tx.pure.string(description),
          tx.pure.u64(deadline),
          adminCapArg,
        ],
      });

      // 4. Execute
      const result = await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            toast.dismiss(tid);
            toast.success("Proposal created successfully!");
            fetchDAO(daoId); // Refresh DAO Data
          },
          onError: () => {
            toast.dismiss(tid);
            toast.error("Transaction Failed!");

          }
        }
      );
    } catch (err) {
      toast.dismiss(tid);
      console.error("create_proposal error:", err);
      toast.error("Failed to create proposal");

    }
  };


  const voteProposal = async (
    daoId: string,
    proposalId: string,
    vote: boolean
  ) => {
    if (!checkMemberShip(daoId)) return;
    const tid = toast.loading("Submitting your vote...");
    try {
      // 1. Fetch DAO shared object
      const daoObj = await client.getObject({
        id: daoId,
        options: { showOwner: true },
      });

      const daoShared = (daoObj.data!.owner as any).Shared;

      // 2. Fetch Proposal shared object
      const proposalObj = await client.getObject({
        id: proposalId,
        options: { showOwner: true },
      });

      const proposalOwner = (proposalObj.data!.owner as any).Shared;
      const proposalInitialVersion = proposalOwner.initial_shared_version;

      // 3. Create transaction
      const tx = new Transaction();

      // DAO shared object ref
      const daoSharedRef = tx.sharedObjectRef({
        objectId: daoId,
        initialSharedVersion: daoShared.initial_shared_version,
        mutable: false, // DAO is read-only in vote()
      });

      // Proposal shared object ref
      const proposalSharedRef = tx.sharedObjectRef({
        objectId: proposalId,
        initialSharedVersion: proposalInitialVersion,
        mutable: true, // Proposal is mutated during voting
      });

      // 4. Get clock object
      const CLOCK_ID = "0x6"; // Sui system clock
      const clockRef = tx.sharedObjectRef({
        objectId: CLOCK_ID,
        initialSharedVersion: 1,
        mutable: false,
      });


      // 5. Move Call
      tx.moveCall({
        target: `${SMART_CONTRACT}::proposal::vote`,
        arguments: [
          daoSharedRef,
          proposalSharedRef,
          tx.pure.bool(vote),
          clockRef,
        ],
      });

      // 6. Execute
      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            toast.dismiss(tid);
            toast.success("Vote submitted!");
            fetchDAO(daoId); // Refresh DAO Data
          },
          onError: () => {
            toast.dismiss(tid);
            toast.error("Voting failed");
          },
        }
      );
    } catch (err) {
      toast.dismiss(tid);
      console.error("voteProposal error:", err);
      toast.error("Failed to vote");
    }
  };



  const removeMember = async (daoId: string, userAddress: string) => {
    if (!checkMemberShip(daoId)) return;

    const tid = toast.loading("Removing member...");
    try {
      // 1. Fetch shared DAO object (&mut DAO)
      const daoObj = await client.getObject({
        id: daoId,
        options: { showOwner: true },
      });

      const sharedOwner = (daoObj.data!.owner as any).Shared;

      if (!sharedOwner) {
        throw new Error("DAO object is not shared");
      }

      // 2. Get DAOCap owned by the caller
      const DAO_CAP_TYPE = import.meta.env.VITE_DAO_CAP_TYPE;

      const owned = await client.getOwnedObjects({
        owner: account?.address,
        options: { showOwner: true, showContent: true },
      });

      const daoCapObj = owned.data.find((o) => {
        const content = o.data?.content;
        if (!content || content.dataType !== "moveObject" || content.type !== DAO_CAP_TYPE) return false;

        const fields = (content as any).fields; // cast to any to access properties safely
        return fields.dao_id === daoId;
      });

      if (!daoCapObj) {
        toast.error("You're not an ADMIN");
        toast.dismiss(tid);
        return;
      }

      const daoCapId = (daoCapObj.data!.content as any).fields.id.id;

      // 3. Build Transaction
      const tx = new Transaction();

      const daoSharedArg = tx.sharedObjectRef({
        objectId: daoId,
        initialSharedVersion: sharedOwner.initial_shared_version,
        mutable: true,
      });

      const daoCapArg = tx.object(daoCapId);

      // 4. Call Move function
      tx.moveCall({
        target: `${SMART_CONTRACT}::dao::remove_member`,
        arguments: [
          daoSharedArg,                        // &mut DAO
          daoCapArg,                           // &DAOCap
          tx.pure.address(userAddress),        // member address to remove
        ],
      });

      // 5. Execute
      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            toast.dismiss(tid);
            toast.success("Member removed successfully");

            fetchDAO(daoId); // refresh UI
          },
          onError: () => {
            toast.dismiss(tid);
            toast.error("Transaction Failed!");
          },
        }
      );
    } catch (err) {
      toast.dismiss(tid);
      console.error("removeMember error:", err);
      toast.error("Failed to remove member");
    }
  };


  const addAdmin = async (
    daoId: string,
    userAddress: string,
    role: "ADMIN" | "MEMBER"
  ) => {
    if (role === "MEMBER") {
      toast.error("Cannot update role to MEMBER, Remove the Member instead");
      return;
    }
    if (!checkMemberShip(daoId)) return;

    const tid = toast.loading(`Updating role to ADMIN...`);
    try {

      // 1. Fetch shared DAO object (for &mut DAO)
      const daoObj = await client.getObject({
        id: daoId,
        options: { showOwner: true },
      });

      const sharedOwner = (daoObj.data!.owner as any).Shared;

      if (!sharedOwner) {
        throw new Error("DAO object is not shared");
      }

      // 2. Get DAOCap owned by the caller
      const DAO_CAP_TYPE = import.meta.env.VITE_DAO_CAP_TYPE;

      const owned = await client.getOwnedObjects({
        owner: account?.address,
        options: { showOwner: true, showContent: true },
      });

      const daoCapObj = owned.data.find((o) => {
        const content = o.data?.content;
        if (!content || content.dataType !== "moveObject" || content.type !== DAO_CAP_TYPE) return false;

        const fields = (content as any).fields; // cast to any to access properties safely
        return fields.dao_id === daoId;
      });

      if (!daoCapObj) {
        toast.dismiss(tid);
        toast.error("You're not an ADMIN");
        setLoading(false);
        return;
      }

      const daoCapId = (daoCapObj.data!.content as any).fields.id.id;

      // 3. Build transaction
      const tx = new Transaction();

      const daoSharedArg = tx.sharedObjectRef({
        objectId: daoId,
        initialSharedVersion: sharedOwner.initial_shared_version,
        mutable: true,
      });

      const daoCapArg = tx.object(daoCapId);

      // 4. Call Move function
      tx.moveCall({
        target: `${SMART_CONTRACT}::dao::add_admin`,
        arguments: [
          daoSharedArg,                // &mut DAO
          daoCapArg,                   // &DAOCap
          tx.pure.address(userAddress),// admin address to add
        ],
      });

      // 5. Execute
      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            toast.dismiss(tid);
            toast.success(`Role updated to ADMIN`);

            fetchDAO(daoId); // Refresh DAO Data
          },
          onError: () => {
            toast.error("Transaction Failed!");
          }
        }
      );
    } catch (err) {
      toast.dismiss(tid);
      console.error("Add_Admin error:", err);
      toast.error("Failed to update member role");
    }
  };


  const checkMemberShip = (daoId: string): boolean => {
    const dao = daos.find(d => d.id === daoId);
    if (!dao) return false;
    let isMember = dao.daoStates.members.includes(account?.address);
    if (!isMember) {
      toast.error("You are not a member of this DAO");
      return false;
    }
    return true;
  }



  return (
    <AppContext.Provider value={{
      daos,
      loading,
      createDao,
      addMember,
      createProposal,
      voteProposal,
      removeMember,
      addAdmin,
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