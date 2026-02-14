// src/components/App.tsx
import React, { useState } from 'react';
import { Box } from 'ink';
import { Header } from './Header.js';
import { Home } from './Home.js';
import { NowPlaying } from './NowPlaying.js';
import { Search } from './Search.js';
import { Playlists } from './Playlists.js';
import { Devices } from './Devices.js';
import type { View } from '../types/index.js';

interface AppProps {
  onExit: () => void;
}

export const App: React.FC<AppProps> = ({ onExit }) => {
  const [currentView, setCurrentView] = useState<View>('home');

  const navigateTo = (view: View) => {
    setCurrentView(view);
  };

  const goHome = () => {
    setCurrentView('home');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onNavigate={navigateTo} onExit={onExit} />;
      case 'now-playing':
        return <NowPlaying onBack={goHome} />;
      case 'search':
        return <Search onBack={goHome} />;
      case 'playlists':
        return <Playlists onBack={goHome} />;
      case 'devices':
        return <Devices onBack={goHome} />;
      default:
        return <Home onNavigate={navigateTo} onExit={onExit} />;
    }
  };

  return (
    <Box flexDirection="column">
      <Header />
      {renderView()}
    </Box>
  );
};
