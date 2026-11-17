# ioBroker VE.Direct Adapter

ioBroker adapter for reading VE.Direct data from Victron devices (solar charge controllers, battery monitors) via USB/serial connection. This read-only adapter implements VE.Direct Protocol Version 3.34 and provides real-time monitoring of Victron energy devices in the ioBroker smart home platform.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites and Dependencies
- Node.js 22 or newer (CI tests 22, 24 and 26)
- Physical Victron device with VE.Direct connector for full functionality
- USB-to-serial cable or direct USB connection

### Bootstrap and Development Setup
- `npm ci` -- NEVER CANCEL: Installs the locked dependencies. Set timeout to 60+ minutes.
- `npm run lint` -- Runs ESLint validation. Takes ~0.3 seconds.
- `npm run test:package` -- Validates package.json and io-package.json files.
- `npm run test:integration` -- NEVER CANCEL: Takes 26-47 seconds. Starts full ioBroker test instance. Set timeout to 90+ minutes.
- `npx tsc --noEmit` (or `npm run check`) -- Type checking; exits with code 0.

### Testing and Validation
- `npm test` -- Runs the mocha suite and package validation
- `npm run test:js` -- Runs the mocha suites (`*.test.js`)
- `npm run test:package` -- Package validation
- `npm run test:integration` -- NEVER CANCEL: Full integration test that starts adapter in test environment (takes 26-47 seconds)

### Build and Release Tasks  
- `npm run translate` -- Translates admin UI text and io-package metadata to multiple languages
- `npx translate-adapter to-words` -- Regenerates `admin/words.js` from the i18n catalogs
- No compilation step needed - this is pure JavaScript with TypeScript type checking

## Validation

### Manual Testing Requirements
- ALWAYS run the integration test after making changes: `npm run test:integration`
- ALWAYS run linting before committing: `npm run lint`
- The adapter starts successfully but cannot publish data without a Victron device on the configured port
- Serial connection errors without hardware are expected
- For hardware testing, configure USB device path in admin interface (e.g., `/dev/ttyUSB0`)

### Expected Test Results
- Integration test should show: "The adapter starts successfully" and "1 passing (26-47s)"
- Package validation passes
- Linting should complete with no errors (takes ~0.3 seconds)
- TypeScript checking exits with code 0

### CI/CD Validation
- Always run `npm run lint` before committing or the GitHub Actions (.github/workflows/test-and-release.yml) will fail
- The CI tests on Node.js 22, 24 and 26 across Ubuntu, Windows, and macOS
- The integration tests do not require hardware; expected connection errors do not fail the run

## Architecture and Key Files

### Core Application Files
- `main.js` -- Adapter lifecycle, configuration, frame sampling and state publication
- `lib/veDirectCom.js` -- SerialPort lifecycle with reconnect and close handling
- `lib/veDirect/veDirectParser.js`, `lib/veDirect/fields.js` -- Byte-oriented parser and field registry
- `lib/stateAttr.js`, `lib/ProductNames.js`, `lib/DeviceModes.js`, `lib/ErrorNames.js`, etc. -- Protocol lookup tables

### Configuration and Admin
- `admin/index_m.html` -- Admin web interface for adapter configuration
- `admin/words.js` -- Generated multi-language text definitions for admin UI
- `io-package.json` -- ioBroker-specific adapter metadata and configuration
- `package.json` -- Standard Node.js package definition

### Development Tools
- `eslint.config.mjs` -- ESLint configuration for code quality
- `tsconfig.json` -- TypeScript configuration for type checking (no compilation)
- `test/` -- Package and integration tests; root `*.test.js` holds the mocha suites

## Common Tasks and Repository Structure

### Repository Layout
The following are key files and directories in the repository:

```
Repository Root:
├── main.js                     # Adapter lifecycle and state publication
├── package.json               # Node.js dependencies and scripts
├── io-package.json           # ioBroker adapter configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.mjs         # ESLint configuration
├── *.test.js                 # Mocha adapter/parser suites
├── admin/                    # Admin UI files
│   ├── index_m.html         # Main admin interface
│   ├── words.js             # Generated multi-language translations
│   └── i18n/                # Translation source files
├── lib/                      # Protocol and device definitions  
│   ├── veDirectCom.js        # Serial port lifecycle
│   ├── veDirect/            # Parser and field registry
│   ├── stateAttr.js         # Legacy state metadata
│   ├── ProductNames.js      # Device product ID mappings
│   ├── DeviceModes.js       # Device mode definitions
│   ├── ErrorNames.js        # Error code mappings
│   └── [other protocol files]
├── test/                     # Package and integration tests
│   ├── integration.js       # Integration tests
│   └── package.js           # Package validation tests
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
- Update `lib/veDirect/fields.js` for new VE.Direct parameters and `lib/ProductNames.js` for new device product IDs
- Update device mode mappings in relevant lib files
- Test with actual hardware if possible

### Modifying Admin Interface
- Edit `admin/index_m.html` for UI changes
- Add labels to `admin/i18n/en/translations.json`, run `npm run translate` for the other languages, then `npx translate-adapter to-words` to regenerate `admin/words.js`
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
- Adapter starts without a configured port and logs that a valid serial port is required
- Integration tests verify startup logic works correctly
- Serial parsing is covered by hardware-independent protocol tests; end-to-end validation needs hardware
- Admin interface and configuration can be tested in ioBroker environment

### Protocol Support
- Implements read-only VE.Direct Protocol Version 3.34
- Supports all standard Victron devices with VE.Direct connectivity
- Frame sampling interval is configurable; every complete frame is still parsed, and the last value per field is published per interval

## Performance and Timing

### Operation Timings (Set Appropriate Timeouts)
- npm ci: 23 seconds - Set timeout to 60+ minutes, NEVER CANCEL
- Integration tests: 26-47 seconds - NEVER CANCEL, set timeout to 90+ minutes  
- Package validation: 18ms (under 1 second) - Set timeout to 30+ minutes
- Linting: 0.3 seconds - Set timeout to 30+ minutes
- Type checking: 3.8 seconds - Set timeout to 30+ minutes

### Runtime Performance
- Serial data processing is real-time with configurable frame sampling
- Connection timeout after 10 seconds of no data
- Memory usage is minimal for typical ioBroker adapter loads

Remember: This adapter requires physical Victron hardware for end-to-end validation. Development and testing focus on ensuring the adapter starts correctly and handles serial communication properly.