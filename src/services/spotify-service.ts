// src/services/spotify-service.ts
import { authService } from '../auth/auth-service.js';
import type { Track, Device, Playlist, PlaybackState, SearchResults, Album, Artist } from '../types/index.js';

export class SpotifyService {
  private get api() {
    return authService.getSpotifyApi();
  }

  // ═══════════════════════════════════════════════════════════════
  // PLAYBACK CONTROL
  // ═══════════════════════════════════════════════════════════════

  async getCurrentlyPlaying(): Promise<Track | null> {
    try {
      const response = await this.api.getMyCurrentPlayingTrack();
      if (!response.body || !response.body.item || response.body.item.type !== 'track') {
        return null;
      }

      const track = response.body.item;
      return {
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => a.name),
        album: track.album.name,
        albumArt: track.album.images[0]?.url,
        duration: track.duration_ms,
        progress: response.body.progress_ms || 0,
        isPlaying: response.body.is_playing,
        uri: track.uri,
      };
    } catch {
      return null;
    }
  }

  async getPlaybackState(): Promise<PlaybackState | null> {
    try {
      const response = await this.api.getMyCurrentPlaybackState();
      if (!response.body) return null;

      const track = response.body.item && response.body.item.type === 'track'
        ? {
            id: response.body.item.id,
            name: response.body.item.name,
            artists: response.body.item.artists.map(a => a.name),
            album: response.body.item.album.name,
            albumArt: response.body.item.album.images[0]?.url,
            duration: response.body.item.duration_ms,
            progress: response.body.progress_ms || 0,
            isPlaying: response.body.is_playing,
            uri: response.body.item.uri,
          }
        : null;

      return {
        isPlaying: response.body.is_playing,
        shuffle: response.body.shuffle_state,
        repeat: response.body.repeat_state as 'off' | 'track' | 'context',
        volume: response.body.device?.volume_percent || 0,
        device: response.body.device
          ? {
              id: response.body.device.id || '',
              name: response.body.device.name,
              type: response.body.device.type,
              isActive: response.body.device.is_active,
              volume: response.body.device.volume_percent || 0,
            }
          : null,
        track,
      };
    } catch {
      return null;
    }
  }

  async play(uri?: string): Promise<void> {
    if (uri) {
      await this.api.play({ uris: [uri] });
    } else {
      await this.api.play();
    }
  }

  async playContext(contextUri: string, offset?: number): Promise<void> {
    await this.api.play({
      context_uri: contextUri,
      offset: offset !== undefined ? { position: offset } : undefined,
    });
  }

  async pause(): Promise<void> {
    await this.api.pause();
  }

  async togglePlayPause(): Promise<boolean> {
    const state = await this.getPlaybackState();
    if (state?.isPlaying) {
      await this.pause();
      return false;
    } else {
      await this.play();
      return true;
    }
  }

  async next(): Promise<void> {
    await this.api.skipToNext();
  }

  async previous(): Promise<void> {
    await this.api.skipToPrevious();
  }

  async seek(positionMs: number): Promise<void> {
    await this.api.seek(positionMs);
  }

  async setVolume(percent: number): Promise<void> {
    const volume = Math.max(0, Math.min(100, percent));
    await this.api.setVolume(volume);
  }

  async setShuffle(state: boolean): Promise<void> {
    await this.api.setShuffle(state);
  }

  async setRepeat(state: 'off' | 'track' | 'context'): Promise<void> {
    await this.api.setRepeat(state);
  }

  async addToQueue(uri: string): Promise<void> {
    await this.api.addToQueue(uri);
  }

  // ═══════════════════════════════════════════════════════════════
  // DEVICES
  // ═══════════════════════════════════════════════════════════════

  async getDevices(): Promise<Device[]> {
    const response = await this.api.getMyDevices();
    return response.body.devices.map(d => ({
      id: d.id || '',
      name: d.name,
      type: d.type,
      isActive: d.is_active,
      volume: d.volume_percent || 0,
    }));
  }

  async transferPlayback(deviceId: string, play = true): Promise<void> {
    await this.api.transferMyPlayback([deviceId], { play });
  }

  // ═══════════════════════════════════════════════════════════════
  // PLAYLISTS
  // ═══════════════════════════════════════════════════════════════

  async getMyPlaylists(limit = 50): Promise<Playlist[]> {
    const response = await this.api.getUserPlaylists(undefined, { limit });
    return response.body.items
      .filter((p) => p !== null)
      .map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        trackCount: p.tracks?.total ?? 0,
        owner: p.owner.display_name || p.owner.id,
        uri: p.uri,
        isPublic: p.public || false,
      }));
  }

  async getPlaylistTracks(playlistId: string, limit = 100): Promise<Track[]> {
    const response = await this.api.getPlaylistTracks(playlistId, { limit });
    return response.body.items
      .filter(item => item.track && item.track.type === 'track')
      .map(item => {
        const track = item.track!;
        return {
          id: track.id,
          name: track.name,
          artists: track.artists.map(a => a.name),
          album: track.album.name,
          albumArt: track.album.images[0]?.url,
          duration: track.duration_ms,
          isPlaying: false,
          uri: track.uri,
        };
      });
  }

  // ═══════════════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════════════

  async search(query: string, types: ('track' | 'playlist' | 'album' | 'artist')[] = ['track'], limit = 10): Promise<SearchResults> {
    const response = await this.api.search(query, types, { limit });

    const tracks: Track[] = response.body.tracks?.items.map(t => ({
      id: t.id,
      name: t.name,
      artists: t.artists.map(a => a.name),
      album: t.album.name,
      albumArt: t.album.images[0]?.url,
      duration: t.duration_ms,
      isPlaying: false,
      uri: t.uri,
    })) || [];

    const playlists: Playlist[] = response.body.playlists?.items.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      trackCount: p.tracks.total,
      owner: p.owner.display_name || p.owner.id,
      uri: p.uri,
      isPublic: p.public || false,
    })) || [];

    const albums: Album[] = response.body.albums?.items.map(a => ({
      id: a.id,
      name: a.name,
      artists: a.artists.map(ar => ar.name),
      releaseDate: a.release_date,
      totalTracks: a.total_tracks,
      uri: a.uri,
    })) || [];

    const artists: Artist[] = response.body.artists?.items.map(a => ({
      id: a.id,
      name: a.name,
      genres: a.genres,
      followers: a.followers.total,
      uri: a.uri,
    })) || [];

    return { tracks, playlists, albums, artists };
  }

  // ═══════════════════════════════════════════════════════════════
  // QUEUE
  // ═══════════════════════════════════════════════════════════════

  async getQueue(): Promise<{ currentTrack: Track | null; queue: Track[] }> {
    const response = await this.api.getMyCurrentPlaybackState();
    // Note: The queue endpoint requires additional implementation
    // For now, return the current track
    const currentTrack = response.body?.item && response.body.item.type === 'track'
      ? {
          id: response.body.item.id,
          name: response.body.item.name,
          artists: response.body.item.artists.map(a => a.name),
          album: response.body.item.album.name,
          duration: response.body.item.duration_ms,
          isPlaying: response.body.is_playing,
          uri: response.body.item.uri,
        }
      : null;

    return { currentTrack, queue: [] };
  }

  // ═══════════════════════════════════════════════════════════════
  // USER
  // ═══════════════════════════════════════════════════════════════

  async getMe(): Promise<{ id: string; name: string; email: string; product: string }> {
    const response = await this.api.getMe();
    return {
      id: response.body.id,
      name: response.body.display_name || response.body.id,
      email: response.body.email,
      product: response.body.product,
    };
  }

  async getRecentlyPlayed(limit = 20): Promise<Track[]> {
    const response = await this.api.getMyRecentlyPlayedTracks({ limit });
    return response.body.items.map(item => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map(a => a.name),
      album: item.track.album.name,
      albumArt: item.track.album.images[0]?.url,
      duration: item.track.duration_ms,
      isPlaying: false,
      uri: item.track.uri,
    }));
  }
}

export const spotifyService = new SpotifyService();
