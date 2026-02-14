// src/components/Search.tsx
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { spotifyService } from '../services/spotify-service.js';
import { formatDuration, truncate } from '../utils/format.js';
import type { Track } from '../types/index.js';

interface SearchProps {
  onBack: () => void;
}

type SearchMode = 'input' | 'results' | 'loading';

export const Search: React.FC<SearchProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('input');
  const [results, setResults] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setMode('loading');
    setError(null);
    
    try {
      const searchResults = await spotifyService.search(query, ['track'], 15);
      setResults(searchResults.tracks);
      setMode('results');
    } catch (err) {
      setError('Search failed. Please try again.');
      setMode('input');
    }
  };

  const handleSelect = async (item: { value: string }) => {
    try {
      setMessage('Adding to queue...');
      await spotifyService.addToQueue(item.value);
      setMessage('✓ Added to queue!');
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setError('Failed to add to queue');
    }
  };

  const handlePlay = async (uri: string) => {
    try {
      await spotifyService.play(uri);
      setMessage('✓ Now playing!');
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setError('Failed to play track');
    }
  };

  useInput((input, key) => {
    if (key.escape) {
      if (mode === 'results') {
        setMode('input');
        setResults([]);
      } else {
        onBack();
      }
    }
  });

  const items = results.map(track => ({
    label: `${truncate(track.name, 30)} • ${truncate(track.artists.join(', '), 20)} • ${formatDuration(track.duration)}`,
    value: track.uri,
  }));

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color="green" bold>🔍 Search Spotify</Text>
      </Box>

      {mode === 'input' && (
        <Box flexDirection="column">
          <Box>
            <Text color="gray">Search: </Text>
            <TextInput
              value={query}
              onChange={setQuery}
              onSubmit={handleSearch}
              placeholder="Type a song, artist, or album..."
            />
          </Box>
          <Box marginTop={1}>
            <Text color="gray" dimColor>Press </Text>
            <Text color="cyan">ENTER</Text>
            <Text color="gray" dimColor> to search, </Text>
            <Text color="cyan">ESC</Text>
            <Text color="gray" dimColor> to go back</Text>
          </Box>
        </Box>
      )}

      {mode === 'loading' && (
        <Box>
          <Text>
            <Spinner type="dots" /> Searching for "{query}"...
          </Text>
        </Box>
      )}

      {mode === 'results' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color="gray">Results for "</Text>
            <Text color="white">{query}</Text>
            <Text color="gray">" ({results.length} tracks)</Text>
          </Box>
          
          {results.length > 0 ? (
            <>
              <SelectInput
                items={items}
                onSelect={handleSelect}
              />
              <Box marginTop={1}>
                <Text color="gray" dimColor>Press </Text>
                <Text color="cyan">ENTER</Text>
                <Text color="gray" dimColor> to add to queue, </Text>
                <Text color="cyan">ESC</Text>
                <Text color="gray" dimColor> to search again</Text>
              </Box>
            </>
          ) : (
            <Text color="yellow">No results found. Try a different search.</Text>
          )}
        </Box>
      )}

      {message && (
        <Box marginTop={1}>
          <Text color="green">{message}</Text>
        </Box>
      )}

      {error && (
        <Box marginTop={1}>
          <Text color="red">✗ {error}</Text>
        </Box>
      )}
    </Box>
  );
};
