// src/types/index.ts

export interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArt?: string;
  duration: number;
  progress?: number;
  isPlaying: boolean;
  uri: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  volume: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackCount: number;
  owner: string;
  uri: string;
  isPublic: boolean;
}

export interface SearchResults {
  tracks: Track[];
  playlists: Playlist[];
  albums: Album[];
  artists: Artist[];
}

export interface Album {
  id: string;
  name: string;
  artists: string[];
  releaseDate: string;
  totalTracks: number;
  uri: string;
}

export interface Artist {
  id: string;
  name: string;
  genres: string[];
  followers: number;
  uri: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
  volume: number;
  device: Device | null;
  track: Track | null;
}

export type View = 
  | 'home'
  | 'now-playing'
  | 'search'
  | 'playlists'
  | 'devices'
  | 'queue'
  | 'settings';

export interface AppState {
  currentView: View;
  isLoading: boolean;
  error: string | null;
  playbackState: PlaybackState | null;
}
