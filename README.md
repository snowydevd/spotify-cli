# 🎵 Spotify CLI

A beautiful command-line interface for Spotify, inspired by Claude Code's aesthetic.

```
   _____ _____   ____ _______ _____ ________     __   _____ _      _____
  / ____|  __ \ / __ \__   __|_   _|  ____\ \   / /  / ____| |    |_   _|
 | (___ | |__) | |  | | | |    | | | |__   \ \_/ /  | |    | |      | |
  \___ \|  ___/| |  | | | |    | | |  __|   \   /   | |    | |      | |
  ____) | |    | |__| | | |   _| |_| |       | |    | |____| |____ _| |_
 |_____/|_|     \____/  |_|  |_____|_|       |_|     \_____|______|_____|
```

## ✨ Features

- 🎧 **Now Playing** - View and control current playback
- 🔍 **Search** - Find tracks, artists, and albums
- 📋 **Playlists** - Browse and play your playlists
- 📡 **Devices** - Switch between Spotify Connect devices
- ⌨️ **Keyboard shortcuts** - Full keyboard control
- 🎨 **Beautiful UI** - Gradient headers, smooth animations

## 📋 Prerequisites

- Node.js 18+
- Spotify Premium account (required for playback control)
- Spotify Developer account

## 🚀 Setup

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in the details:
   - App name: `Spotify CLI`
   - App description: `CLI for Spotify`
   - Redirect URI: `http://localhost:8888/callback`
4. Select "Web API" when asked which APIs you'll use
5. Save and note your **Client ID** and **Client Secret**

### 2. Configure Environment

Create a `.env` file or set environment variables:

```bash
export SPOTIFY_CLIENT_ID="your_client_id_here"
export SPOTIFY_CLIENT_SECRET="your_client_secret_here"
```

Or edit `src/config/spotify.ts` directly with your credentials.

### 3. Install Dependencies

```bash
npm install
```

### 4. Build the CLI

```bash
npm run build
```

### 5. Login to Spotify

```bash
npm start -- login
# or after installing globally:
spotify login
```

## 🎮 Usage

### Interactive Mode

```bash
spotify
```

This opens the full interactive interface with:
- Arrow keys to navigate
- Enter to select
- ESC to go back
- Various shortcuts per view

### Quick Commands

```bash
# Show current track
spotify now

# Play/resume
spotify play

# Play a specific track
spotify play "bohemian rhapsody"

# Pause
spotify pause

# Next/Previous
spotify next
spotify prev

# Set volume (0-100)
spotify volume 50

# Logout
spotify logout
```

## ⌨️ Keyboard Shortcuts

### Now Playing View
| Key | Action |
|-----|--------|
| `SPACE` | Play/Pause |
| `N` | Next track |
| `P` | Previous track |
| `+` / `=` | Volume up |
| `-` | Volume down |
| `S` | Toggle shuffle |
| `R` | Cycle repeat mode |
| `ESC` | Back to menu |

### Search View
| Key | Action |
|-----|--------|
| `ENTER` | Search / Add to queue |
| `ESC` | Back |

### Playlists View
| Key | Action |
|-----|--------|
| `ENTER` | Open playlist / Play track |
| `P` | Play entire playlist |
| `ESC` | Back |

### Devices View
| Key | Action |
|-----|--------|
| `ENTER` | Transfer playback |
| `R` | Refresh devices |
| `ESC` | Back |

## 🛠️ Development

```bash
# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run built version
npm start
```

## 📦 Project Structure

```
spotify-cli/
├── src/
│   ├── index.tsx           # CLI entry point
│   ├── config/
│   │   └── spotify.ts      # Spotify API config
│   ├── auth/
│   │   └── auth-service.ts # OAuth handling
│   ├── services/
│   │   └── spotify-service.ts  # Spotify API wrapper
│   ├── components/
│   │   ├── App.tsx         # Main app component
│   │   ├── Header.tsx      # Gradient header
│   │   ├── Home.tsx        # Main menu
│   │   ├── NowPlaying.tsx  # Playback control
│   │   ├── Search.tsx      # Search interface
│   │   ├── Playlists.tsx   # Playlist browser
│   │   └── Devices.tsx     # Device selector
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── utils/
│       └── format.ts       # Formatting utilities
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 Required Scopes

The CLI requests the following Spotify scopes:
- `user-read-playback-state` - Read playback state
- `user-modify-playback-state` - Control playback
- `user-read-currently-playing` - Current track info
- `user-library-read` - Access saved tracks
- `playlist-read-private` - Read private playlists
- `playlist-read-collaborative` - Read collaborative playlists
- `user-read-private` - User profile info
- `user-read-recently-played` - Recently played tracks

## ⚠️ Limitations

- **Spotify Premium required** for playback control
- Playback must be active on at least one device
- Some features may have rate limits

## 📄 License

MIT

---

Made with ♫ and ☕
