import { DAO } from './types';

const MOCK_OWNER = "0x71C...9A23";

export const INITIAL_DAOS: DAO[] = [
  {
    id: "0xa4d982b6c",
    title: "Solar Punk Collective",
    description: "Funding renewable energy projects in emerging markets through decentralized governance.",
    owner: MOCK_OWNER,
    members: [
      { address: MOCK_OWNER, role: 'ADMIN' },
      { address: "0x82a...11b", role: 'MEMBER' },
      { address: "0x99c...33d", role: 'MEMBER' }
    ],
    proposals: [
      {
        id: "prop_1",
        title: "Fund Solar Project Alpha",
        description: "Allocate 5000 SUI to build solar panels in Grid B.",
        creator: MOCK_OWNER,
        yes: 45,
        no: 12,
        deadline: Date.now() + 86400000,
        isClosed: false
      },
      {
        id: "prop_2",
        title: "Partner with GreenDefi",
        description: "Strategic partnership proposal for liquidity provision.",
        creator: "0x82a...11b",
        yes: 120,
        no: 5,
        deadline: Date.now() - 100000,
        isClosed: true
      }
    ]
  },
  {
    id: "0xb7e219f8a",
    title: "DeFi Educators",
    description: "A community dedicated to creating high-quality educational content for DeFi protocols.",
    owner: "0x123...abc",
    members: [
      { address: "0x123...abc", role: 'ADMIN' },
      { address: MOCK_OWNER, role: 'MEMBER' }
    ],
    proposals: [
        {
            id: "prop_3",
            title: "Q3 Content Budget",
            description: "Approve 10k USDC for video production.",
            creator: "0x123...abc",
            yes: 10,
            no: 2,
            deadline: Date.now() + 400000000,
            isClosed: false
        }
    ]
  },
  {
    id: "0xc8f320e1b",
    title: "Artisan Guild",
    description: "Supporting digital artists and NFT creators with grants and exhibitions.",
    owner: "0x456...def",
    members: Array(15).fill(null).map((_, i) => ({ address: `0xUser${i}...`, role: 'MEMBER' })),
    proposals: []
  },
  {
      id: "0xd9g431h2c",
      title: "Gaming DAO",
      description: "Investing in early stage blockchain games.",
      owner: "0x789...ghi",
      members: [
          { address: "0x789...ghi", role: 'ADMIN'}
      ],
      proposals: []
  }
];


export const SMART_CONTRACT = import.meta.env.VITE_SMART_CONTRACT_PACKAGE_ID;
export const DAO_LIST_ID = import.meta.env.VITE_DAO_LIST_ID;