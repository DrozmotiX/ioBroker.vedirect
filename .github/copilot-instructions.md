# ioBroker VE.Direct Adapter

ioBroker adapter for reading VE.Direct data from Victron devices (solar charge controllers, battery monitors) via USB/serial connection. This adapter implements the VE.Direct Protocol Version 3.33 and provides real-time monitoring of Victron energy devices in the ioBroker smart home platform.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites and Dependencies
- Node.js 16.x, 18.x, or 20.x (tested versions)
- Physical Victron device with VE.Direct connector for full functionality
- USB-to-serial cable or direct USB connection

### Bootstrap and Development Setup
- `npm install` -- NEVER CANCEL: Takes 23 seconds to complete. Set timeout to 60+ minutes.
- `npm run lint` -- Runs ESLint validation. Takes ~0.3 seconds.
- `npm run test:package` -- Validates package.json and io-package.json files. Takes ~18ms, shows 40 passing tests.
- `npm run test:integration` -- NEVER CANCEL: Takes 26-47 seconds. Starts full ioBroker test instance. Set timeout to 90+ minutes.
- `npx tsc --noEmit` -- Type checking (has 7 non-blocking type errors). Takes ~3.8 seconds.

### Testing and Validation
- `npm test` -- Attempts to run full test suite but uses deprecated mocha.opts configuration (fails with deprecation error)
- `npm run test:js` -- Also fails due to deprecated mocha.opts configuration (same error as npm test)
- `npm run test:package` -- Package validation (always works, shows 40 passing tests in ~18ms)
- `npm run test:unit` -- Deprecated unit tests (runs but shows deprecation warning)
- `npm run test:integration` -- NEVER CANCEL: Full integration test that starts adapter in test environment (takes 26-47 seconds)

### Build and Release Tasks  
- `npx gulp` -- Runs default gulp tasks (updatePackages, updateReadme)
- `npx gulp translate` -- Translates admin UI text to multiple languages
- No compilation step needed - this is pure JavaScript with TypeScript type checking

## Validation

### Manual Testing Requirements
- ALWAYS run the integration test after making changes: `npm run test:integration`
- ALWAYS run linting before committing: `npm run lint`
- The adapter will start successfully but cannot connect without physical Victron hardware
- Connection errors like "TypeError: 'path' is not defined" are EXPECTED without hardware
- For hardware testing, configure USB device path in admin interface (e.g., `/dev/ttyUSB0`)

### Expected Test Results
- Integration test should show: "The adapter starts successfully" and "1 passing (26-47s)"
- Connection errors "TypeError: 'path' is not defined" are EXPECTED without hardware
- Package validation should show "40 passing (18ms)"
- Linting should complete with no errors (takes ~0.3 seconds)
- TypeScript checking shows 7 type errors but exits with code 2 - this is non-blocking

### CI/CD Validation
- Always run `npm run lint` before committing or the GitHub Actions (.github/workflows/test-and-release.yml) will fail
- The CI tests on Node.js 16.x, 18.x, 20.x across Ubuntu, Windows, and macOS
- Integration tests in CI will also fail to connect to hardware - this is expected

## Architecture and Key Files

### Core Application Files
- `main.js` -- Main adapter entry point, handles serial communication and data parsing
- `lib/stateAttr.js` -- VE.Direct protocol state definitions and attributes
- `lib/ProductNames.js` -- Victron device product ID mappings
- `lib/DeviceModes.js`, `lib/ErrorNames.js`, etc. -- Protocol-specific lookup tables

### Configuration and Admin
- `admin/index_m.html` -- Admin web interface for adapter configuration
- `admin/words.js` -- Multi-language text definitions for admin UI
- `io-package.json` -- ioBroker-specific adapter metadata and configuration
- `package.json` -- Standard Node.js package definition

### Development Tools
- `.eslintrc.json` -- ESLint configuration for code quality
- `tsconfig.json` -- TypeScript configuration for type checking (no compilation)
- `gulpfile.js` -- Gulp tasks for translations and package management
- `test/` -- Test files using @iobroker/testing framework

## Common Tasks and Repository Structure

### Repository Layout
The following are key files and directories in the repository:

```
Repository Root:
├── main.js                     # Main adapter entry point
├── package.json               # Node.js dependencies and scripts
├── io-package.json           # ioBroker adapter configuration
├── gulpfile.js               # Build and translation tasks
├── tsconfig.json             # TypeScript configuration
├── .eslintrc.json            # ESLint configuration
├── admin/                    # Admin UI files
│   ├── index_m.html         # Main admin interface
│   ├── words.js             # Multi-language translations
│   └── i18n/                # Translation files
├── lib/                      # Protocol and device definitions  
│   ├── stateAttr.js         # VE.Direct state definitions
│   ├── ProductNames.js      # Device product ID mappings
│   ├── DeviceModes.js       # Device mode definitions
│   ├── ErrorNames.js        # Error code mappings
│   └── [other protocol files]
├── test/                     # Test files
│   ├── integration.js       # Integration tests
│   ├── package.js           # Package validation tests
│   └── unit.js              # Unit tests (deprecated)
└── .github/                  # GitHub workflows and settings
    └── workflows/
        └── test-and-release.yml
```

### Making Code Changes
- Edit JavaScript files directly (no build step required)
- Run `npm run lint` to check code quality
- Run `npm run test:integration` to verify adapter still starts
- Test with actual Victron hardware if available

### Adding New Device Support
- Update `lib/ProductNames.js` with new device product IDs
- Update `lib/stateAttr.js` if new VE.Direct parameters are introduced
- Update device mode mappings in relevant lib files
- Test with actual hardware if possible

### Modifying Admin Interface
- Edit `admin/index_m.html` for UI changes
- Update `admin/words.js` for new translatable text
- Run `npx gulp translate` to generate translations
- Test admin interface in ioBroker environment

### Troubleshooting Connection Issues
- Verify USB device path in adapter configuration (typically `/dev/ttyUSB0` on Linux)
- Check that serialport library supports the device
- Monitor adapter logs for serial communication errors
- Ensure Victron device is set to communicate via VE.Direct protocol

## Hardware Requirements and Limitations

### Physical Requirements
- Victron device with VE.Direct port (MPPT controllers, BMV battery monitors, etc.)
- USB cable or USB-to-VE.Direct cable
- Proper device permissions for serial port access

### Development Without Hardware
- Adapter will start but immediately show connection errors - this is expected
- Integration tests verify startup logic works correctly
- Main functionality (serial parsing) cannot be tested without hardware
- Admin interface and configuration can be tested in ioBroker environment

### Protocol Support
- Implements VE.Direct Protocol Version 3.33 (latest as of adapter version 0.3.3)
- Supports all standard Victron devices with VE.Direct connectivity
- Message buffering configurable to prevent system overload

## Performance and Timing

### Operation Timings (Set Appropriate Timeouts)
- npm install: 23 seconds - Set timeout to 60+ minutes, NEVER CANCEL
- Integration tests: 26-47 seconds - NEVER CANCEL, set timeout to 90+ minutes  
- Package validation: 18ms (under 1 second) - Set timeout to 30+ minutes
- Linting: 0.3 seconds - Set timeout to 30+ minutes
- Type checking: 3.8 seconds - Set timeout to 30+ minutes

### Runtime Performance
- Serial data processing is real-time with configurable message buffering
- Connection timeout after 10 seconds of no data
- Memory usage is minimal for typical ioBroker adapter loads

Remember: This adapter requires physical Victron hardware for full functionality. Development and testing focus on ensuring the adapter starts correctly and handles serial communication properly.