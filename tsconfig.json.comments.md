# TypeScript Configuration Comments

Since `tsconfig.json` is a JSON file and doesn't support comments, here are detailed explanations:

## Compiler Options Explained

### `"target": "es5"`
- Compiles TypeScript to ES5 JavaScript
- Maximum browser compatibility
- Older browsers support
- Next.js handles modern features via Babel

### `"lib": ["dom", "dom.iterable", "es6"]`
- `dom`: DOM types (document, window, etc.)
- `dom.iterable`: Iterable DOM types (NodeList, etc.)
- `es6`: ES6 standard library types
- Needed for browser APIs and React/Next.js

### `"allowJs": true`
- Allows importing .js files in .ts files
- Useful for gradual migration
- Enables mixing JS and TS

### `"skipLibCheck": true`
- Skips type checking of declaration files (.d.ts)
- Faster compilation
- Common in Next.js projects

### `"strict": true`
- Enables all strict type checking options
- Includes: strictNullChecks, strictFunctionTypes, etc.
- Better type safety
- Catches more errors at compile time

### `"noEmit": true`
- Doesn't emit JavaScript files
- Next.js handles compilation
- TypeScript only checks types

### `"esModuleInterop": true`
- Enables interoperability between CommonJS and ES modules
- Allows default imports from CommonJS modules
- Required for many npm packages

### `"module": "esnext"`
- Uses ES modules (import/export)
- Next.js handles module resolution
- Modern module system

### `"moduleResolution": "bundler"`
- Uses bundler-style module resolution
- Works with Next.js bundler
- Supports modern import patterns

### `"resolveJsonModule": true`
- Allows importing JSON files as modules
- Type-safe JSON imports
- Useful for config files, data, etc.

### `"isolatedModules": true`
- Ensures each file can be safely transpiled independently
- Required for some build tools
- Better performance

### `"jsx": "preserve"`
- Preserves JSX syntax (doesn't transform)
- Next.js handles JSX transformation
- Required for React/Next.js

### `"incremental": true`
- Enables incremental compilation
- Only recompiles changed files
- Faster build times

### `"plugins": [{ "name": "next" }]`
- Next.js TypeScript plugin
- Provides Next.js-specific type checking
- Enables Next.js features in TypeScript

### `"baseUrl": "."`
- Sets base directory for module resolution
- Current directory (project root)
- Used with paths for aliases

### `"paths": { "@/*": ["./*"] }`
- Maps @/* to project root
- Allows imports like: `import { ... } from "@/lib/utils"`
- Cleaner import paths
- Easier refactoring

## Include/Exclude

- **include**: Files to compile (all .ts, .tsx files)
- **exclude**: Files to skip (node_modules)

