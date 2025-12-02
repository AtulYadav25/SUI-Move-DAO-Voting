import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ExploreDaos } from './pages/ExploreDaos';
import { DaoDetails } from './pages/DaoDetails';
import { MyDaos } from './pages/MyDaos';
import LoadingScreen from './components/LoadingScreen';


const App = () => {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 selection:bg-blue-500/30">
            <LoadingScreen />
           <Navbar />
           <main className="flex-grow">
              <Routes>
                 <Route path="/" element={<Home />} />
                 <Route path="/explore-dao" element={<ExploreDaos />} />
                 <Route path="/dao/:daoId" element={<DaoDetails />} />
                 <Route path="/my-daos" element={<MyDaos />} />
              </Routes>
           </main>
           <Footer />
           
           <Toaster 
             position="bottom-right"
             toastOptions={{
                style: {
                   background: '#18181b',
                   border: '1px solid #27272a',
                   color: '#fafafa',
                   fontSize: '14px',
                },
                success: {
                   iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fafafa',
                   }
                }
             }}
           />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
