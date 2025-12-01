
# DAO Vote – A Minimalistic DAO Voting dApp on Sui Blockchain


![DAO Vote Screenshot](https://i.ibb.co/MkG61n5w/Screenshot-395.png)



## Introduction

DAO Vote is a minimal, dark-themed, on-chain governance application built using **Sui Move** (smart contracts) and **React + TypeScript** (frontend). It allows users to create DAOs, join them, create proposals, and vote with a simple and modern UI.

## DAO Description
DAO Vote is designed to be an easy-to-use governance platform on the Sui blockchain. Any user can create a DAO, add members, create proposals, and allow voting. The frontend is built using React, Tailwind CSS, shadcn/ui, Lucide icons, and TypeScript with a fully modular file structure.
The backend smart contract is written in Sui Move and includes DAO management, proposal creation, voting, and membership logic.

You can use the full application or only the frontend by plugging in your own Sui package ID and object IDs.

---

## Features

### Smart Contract Features

* Create DAOs
* Add members to a DAO
* Promote members to admin
* Create proposals
* Vote on proposals (Yes/No)
* Automatic vote tracking
* Deadlines for proposals
* Ownership and admin capabilities

### Frontend Features

* Minimalistic dark UI with glass-effect
* Tailwind CSS with zinc theme
* shadcn/ui components
* Lucide icons
* React Router navigation
* React Hot Toast notifications
* Dedicated Components for DAOs, proposals, cards & Detailed Pages
* Skeleton loaders
* Fully responsive
* Clean code architecture with reusable components

---

## Prerequisites

If you want to compile, test, or publish the Sui smart contract, you must install the Sui CLI.

You can install it from the official documentation:
[https://docs.sui.io/guides/developer/getting-started/sui-install](https://docs.sui.io/guides/developer/getting-started/sui-install)

### **Installing SUI CLI is optional**

If you only want to run the frontend and interact with an already deployed contract, you do not need Sui CLI.

Use the following values in your `.env` file:

```
VITE_SUI_PACKAGE_ID="HERE"
VITE_SUI_OBJECT_ID_LIST="HERE"
```

Replace them with your contract values if you deployed your own.

---

## Smart Contract Guide

### 1. Build the Contract

Navigate to the smart contract folder:

```
sui move build
```

### 2. Run Tests

To execute all test cases:

```
sui move test
```

### 3. Publish the Contract

To publish the package on Devnet/Testnet/Mainnet:

```
sui client publish --gas-budget 100000000
```

Copy the published package ID and update your `.env` file in the frontend accordingly.

---

## Frontend Setup Guide

### 1. Install Dependencies

Navigate to the frontend directory and run:

```
npm install
```

### 2. Run Development Server

Start the project:

```
npm run dev
```

Your application will be available on:

```
http://localhost:3000
```

---


## Conclusion

DAO Vote is a clean, developer-friendly project showcasing how to build a complete DAO governance system on the Sui blockchain using modern frontend architecture. You can extend it further, integrate wallet signing, or deploy it publicly.

If you need improvements, deployment instructions, TypeScript API services, or UI polishing, you can get here with a PR anytime. PR are welcomed! 🤝

## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
