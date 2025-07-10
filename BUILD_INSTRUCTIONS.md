# 🔨 BUILD EXECUTABLE INSTRUCTIONS

## Quick Build (Windows)

**Run the build script:**
```
Double-click build-exe.bat
```

## Manual Build Commands

### Windows Executable + Installer
```bash
npm install
npm run build:win
```

### All Platforms
```bash
npm run dist
```

### Portable Only
```bash
npm run pack
```

## Output Files

After building, check the `dist` folder for:

- **Conjuration Setup.exe** - Windows installer
- **Conjuration.exe** - Portable executable
- **win-unpacked/** - Unpacked application folder

## Icon Setup

Replace `build/icon.ico` with your actual icon file (256x256 recommended).

## Build Requirements

- Node.js installed
- npm dependencies installed
- Windows (for Windows builds)

## Distribution

The installer will:
- Create desktop shortcut
- Add to Start Menu
- Allow custom install location
- Include uninstaller

Ready to distribute! 🚀