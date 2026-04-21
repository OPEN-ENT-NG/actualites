# Vite Migration Guide - Step by Step Upgrade Template

## 📍 Current Setup (Update with your project details)

- **Vite**: [Current Version] → Target: **8.0.9** (proven working)
- **@vitejs/plugin-react**: [Current Version] → Target: **5.2.0** (Vite 8.x compatible)
- **Vitest**: [Current Version] → Target: **4.1.5** (proven compatible with Vite 8.0.9)
- **@vitest/coverage-v8**: [Current Version] → Target: **4.1.5** (proven working)
- **@vitest/ui**: [Current Version] → Target: **4.1.5** (proven working)
- **@types/node**: [Current Version] → Target: **20.19.39** (required for Vite 7+)
- **Node.js requirement**: Check >=20 <=22 compatibility
- **🎯 TARGET**: Vite 8.0.9 + Vitest 4.1.5 + Rolldown bundler + Oxc transforms

## 🗺️ Upgrade Path

**Strategy**: Upgrade Vite and Vitest together for compatibility (proven path)

1. **Vitest Upgrade to 3.2.4 → 4.1.5** (if needed)
2. **Vite 5.x → Vite 6.4.2 + Vitest 4.1.5**
3. **Vite 6.4.2 → Vite 7.3.2 + Vitest 4.1.5**
4. **Vite 7.3.2 → Vite 8.0.9 + Vitest 4.1.5** (Major Rolldown upgrade)

---

## 🚀 **Step 1: Vitest Upgrade (If Needed)**

### Summary

Upgrade Vitest first to ensure compatibility with newer Vite versions

### Package Updates Required

```bash
# Check current Vitest version
npx vitest --version

# Upgrade Vitest to v3.2.4 (proven working)
pnpm update vitest@3.2.4 @vitest/coverage-v8@3.2.4 @vitest/ui@3.2.4

# Or upgrade to v4.1.5 for Vite 6+ compatibility (recommended target)
pnpm update vitest@4.1.5 @vitest/coverage-v8@4.1.5 @vitest/ui@4.1.5
```

### Vitest New Features

**Vitest 3.x+ features**:

- Enhanced workspace support
- Better TypeScript performance
- Improved watch mode
- New assertion APIs

**Vitest 4.x+ features**:

- Enhanced Vite 6+ compatibility
- Improved workspace support
- Better TypeScript performance
- New assertion APIs

### Testing Checklist

- [ ] Run `pnpm run build` - check for build errors
- [ ] Run `pnpm run dev` - test dev server
- [ ] Run `pnpm run test` - ensure Vitest tests pass
- [ ] Verify `npx vitest --version` shows expected version
- [ ] Check CSS imports and Sass compilation
- [ ] Verify JSON imports work correctly
- [ ] Test coverage reports with @vitest/coverage-v8

---

## 🚀 **Step 2: Vite 5.x → Vite 6.4.2 + Vitest 4.1.5**

### Package Updates Required

```bash
# Upgrade Vite and related packages to proven versions
pnpm update vite@6.4.2 @vitejs/plugin-react@4.7.0

# Upgrade Vitest to v4.1.5 for Vite 6 compatibility (proven working)
pnpm update vitest@4.1.5 @vitest/coverage-v8@4.1.5 @vitest/ui@4.1.5
```

### Vite 5.x → 6.4.2 Changes

1. **Environment API** - Internal refactoring, most apps shouldn't be affected
2. **Vite Runtime API** → **Module Runner API** (if you were using experimental features)

### Breaking Changes to Address

#### **1. resolve.conditions defaults changed**

**Issue**: Default values now explicit instead of internal additions
**Solution**: If you customized `resolve.conditions`, update your config:

```js
// vite.config.ts
import { defineConfig, defaultClientConditions } from 'vite';

export default defineConfig({
  resolve: {
    conditions: ['custom', ...defaultClientConditions], // Add any custom conditions
  },
});
```

#### **2. JSON handling changes**

**Changes**:

- `json.stringify` default changed to `'auto'` (was `true`)
- When `json.stringify: true`, `json.namedExports` is now respected (was disabled)

**Action**: Check if you have custom JSON imports and test behavior

#### **3. Sass Modern API is now default**

**Issue**: Legacy API was default in Vite 5
**Solution**: If you need legacy API temporarily:

```js
// vite.config.ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      sass: { api: 'legacy' },
      scss: { api: 'legacy' },
    },
  },
});
```

#### **4. Library mode CSS naming**

**Issue**: CSS files now use package name instead of `style.css`
**Solution**: Update import paths or set explicit name:

```js
// vite.config.ts (if building a library)
export default defineConfig({
  build: {
    lib: {
      cssFileName: 'style', // to keep old behavior
    },
  },
});
```

#### **5. postcss-load-config updated to v6**

**Issue**: Requires tsx/jiti for TypeScript configs instead of ts-node
**Solution**: Install if using TS PostCSS config:

```bash
pnpm add -D tsx
```

#### **6. Advanced: commonjsOptions.strictRequires**

**Change**: Now `true` by default (was `'auto'`)
**Impact**: May lead to larger bundles but more deterministic builds

### Testing Checklist

- [ ] Run `pnpm run build` - check for build errors
- [ ] Run `pnpm run dev` - test dev server
- [ ] Run `pnpm run test` - ensure Vitest 4.x tests pass
- [ ] Verify `npx vitest --version` shows v4.x
- [ ] Check CSS imports and Sass compilation
- [ ] Verify JSON imports work correctly
- [ ] Test coverage reports with @vitest/coverage-v8 v4.x

### Configuration Updates

**Common issue**: TypeScript configuration may need `"@types/node"` added to `tsconfig.app.json` types array to resolve `NodeJS.Timeout` and `process` errors

---

## 🚀 **Step 3: Vite 6.4.2 → Vite 7.3.2 + Vitest 4.1.5**

### Package Updates Required

```bash
# Upgrade Vite to v7.3.2 (proven working)
pnpm update vite@7.3.2

# Vitest 4.1.5 remains compatible with Vite 7.3.2 (verified)
# No Vitest upgrade needed - 4.1.5 is proven compatible
```

### Vitest 4.1.5 Compatibility with Vite 7.3.2

**Proven Compatibility**: Vitest 4.1.5 is fully compatible with Vite 7.3.2
**Discovery**: Vitest 5.x may not exist yet - 4.1.5 is the proven choice

### Vite 6.4.2 → 7.3.2 Changes

#### **1. Node.js Support**

**Requirement**: Node.js 20.19+ / 22.12+ (was 18+)
**Action**: Verify your Node.js version meets requirements

#### **2. Browser Targets Updated**

**Changes**:

- Chrome: 87 → 107
- Edge: 88 → 107
- Firefox: 78 → 104
- Safari: 14.0 → 16.0
- New default: `'baseline-widely-available'` (instead of `'modules'`)

**Action**: Review if you need to support older browsers:

```js
// vite.config.ts (if you need older browser support)
export default defineConfig({
  build: {
    target: 'es2015', // or specific browsers
  },
});
```

#### **3. Sass Legacy API Completely Removed**

**Issue**: Cannot use `api: 'legacy'` anymore
**Action**: **MUST** migrate to modern Sass API before this step
**Reference**: [Sass Modern API Migration](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/)

#### **4. Removed Features**

- `splitVendorChunkPlugin` - use `build.rollupOptions.output.manualChunks`
- Hook-level `enforce`/`transform` for `transformIndexHtml` - use `order`/`handler`

### Testing Checklist

- [ ] **Vite upgrade**: Check latest 7.x version achieved
- [ ] **Vitest compatibility**: Verify current Vitest version works with Vite 7.x
- [ ] Run `pnpm run build` - test build success
- [ ] Run `pnpm run dev` - test dev server functionality
- [ ] Run `pnpm run test` - verify all tests pass
- [ ] Verify `npx vitest --version` - check Vitest compatibility
- [ ] Verify Sass compilation works (modern API only)
- [ ] Test in target browsers
- [ ] Check coverage reports functionality

### Configuration Updates

- **Typically no configuration changes required**: Vite 7.x is fully backward compatible
- **Verify Vitest compatibility**: Ensure no breaking changes with current setup

---

## 🚀 **Step 4: Vite 7.3.2 → Vite 8.0.9** ⚠️ **MAJOR CHANGES**

### Package Updates Required

```bash
# Upgrade Vite to v8.0.9 (proven working)
pnpm update vite@8.0.9

# Update @vitejs/plugin-react for Vite 8.x compatibility (verified working)
pnpm update @vitejs/plugin-react@5.2.0

# Vitest 4.1.5 is proven compatible with Vite 8.0.9
# No Vitest upgrade needed - current versions work perfectly

# esbuild fallback typically not needed - Oxc works correctly
# pnpm add -D esbuild  # Only if issues arise
```

### Vitest Compatibility with Vite 8.0.9

**Proven Status**: Vitest 4.1.5 is fully compatible with Vite 8.0.9
**Discovery**: Vitest 5.x/6.x not needed - 4.1.5 works perfectly
**Migration**: No Vitest upgrade required from 4.1.5

**Expected Vitest 4.1.5 compatibility with Vite 8.0.9**:

- ✅ Compatibility with Rolldown bundler (verified working)
- ✅ Support for Oxc transformations in test files (verified working)
- ✅ Enhanced browser testing integration
- ✅ TypeScript support (verified working)

### Vite 7.3.2 → 8.0.9 Changes

Vite 8 switches to:

- **[Rolldown](https://rolldown.rs/)** instead of Rollup for bundling
- **[Oxc](https://oxc.rs/)** instead of esbuild for transforms & minification
- **Lightning CSS** for CSS minification

### Critical Configuration Migrations

#### **1. esbuild → oxc config**

```js
// BEFORE (deprecated in v8)
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    jsxDev: true,
    define: { __DEV__: 'true' }
  }
})

// AFTER
export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
      development: true
    },
    define: { __DEV__: 'true' }
  }
})
```

#### **2. build.rollupOptions → build.rolldownOptions**

```js
// BEFORE
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
})

// AFTER
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        // Object form manualChunks removed
        // Use codeSplitting for more flexibility
        codeSplitting: {
          strategy: 'split-by-experience'
        }
      }
    }
  }
})
```

#### **3. optimizeDeps migration**

```js
// BEFORE
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      minify: true,
      define: { global: 'globalThis' },
      loader: { '.js': 'jsx' }
    }
  }
})

// AFTER
export default defineConfig({
  optimizeDeps: {
    rolldownOptions: {
      output: { minify: true },
      transform: { define: { global: 'globalThis' } },
      moduleTypes: { '.js': 'jsx' }
    }
  }
})
```

#### **4. Fallback to esbuild if needed**

```js
// If Oxc causes issues, temporary fallback:
export default defineConfig({
  build: {
    minify: 'esbuild', // instead of default Oxc
    cssMinify: 'esbuild', // instead of default Lightning CSS
  },
  // Keep using transformWithEsbuild (deprecated)
  // Note: Need to install esbuild manually as devDependency
});
```

### Important Behavioral Changes

#### **1. CommonJS Interop Changes**

**Issue**: More consistent `default` import handling from CJS modules
**Symptoms**: Imports that worked before may break
**Temporary Fix**:

```js
export default defineConfig({
  legacy: {
    inconsistentCjsInterop: true, // temporary compatibility
  },
});
```

**Permanent Fix**: Update imports to use correct format

#### **2. Module Resolution Changes**

**Issue**: Removed format sniffing for `browser`/`module` fields
**Impact**: Now strictly respects `resolve.mainFields` order
**Solution**: Use `resolve.alias` for specific mappings if needed

#### **3. Import Meta URL in UMD/IIFE**

**Issue**: `import.meta.url` now throws in UMD/IIFE formats
**Solution**: Use conditional checks or avoid in these formats

### Testing Checklist

- [ ] **Vite upgrade**: Verify latest 8.x version installed
- [ ] **@vitejs/plugin-react upgrade**: Verify compatibility version
- [ ] **Vitest compatibility**: Test current Vitest version with Vite 8.x
- [ ] Run `pnpm run build` - test with Rolldown bundler
- [ ] Run `pnpm run dev` - test with Oxc transforms
- [ ] Run `pnpm run test` - verify all tests pass with new stack
- [ ] Verify `npx vitest --version` - check compatibility
- [ ] Verify Rolldown bundler working (check build output)
- [ ] Verify Oxc transforms working (TypeScript compilation)
- [ ] Test CSS minification with Lightning CSS
- [ ] Check for any configuration migration warnings
- [ ] Verify no esbuild fallbacks needed

### Configuration Updates

- **Migration typically automatic**: Vite 8.0.9 aims for backward compatibility
- **@vitejs/plugin-react 5.2.0 required**: For Vite 8.x support
- **Rolldown migration**: Usually automatic, manual config rarely needed
- **Oxc transforms**: Usually automatic, manual config rarely needed
- **Monitor build output**: Check for any migration warnings or errors

---

## 🎉 **Migration Complete!**

### 🏆 **Expected Benefits**

**Major Technology Upgrades**:

- 🔧 **Bundler**: Rollup → **Rolldown** (faster, more efficient)
- ⚡ **Transforms**: esbuild → **Oxc** (faster TypeScript/JSX processing)
- 🎯 **Testing**: Enhanced Vitest capabilities
- 🔄 **Compatibility**: Maintained backward compatibility

**Performance Benefits**:

- ✨ **Faster builds** with Rolldown bundler
- ⚡ **Faster dev server** with Oxc transforms
- 🚀 **Better tree shaking** and code splitting
- 📦 **Smaller bundle sizes** with improved optimization

### 🎯 **Post-Migration Steps**

- [ ] **All tests passing** - Verify complete functionality
- [ ] **Build working** - Check build times and output
- [ ] **Dev server functional** - Test development experience
- [ ] **Coverage reports working** - Verify testing infrastructure
- [ ] **TypeScript compilation successful** - Check for any issues
- [ ] Update other dependencies to latest compatible versions
- [ ] Review build warnings for further optimizations
- [ ] Explore new Vite 8.x features and Rolldown-specific optimizations

---

_Template created for Vite migration projects_  
_Proven path: Vite 8.0.9 + @vitejs/plugin-react 5.2.0 + Vitest 4.1.5_  
_Target: Vite 8.0.9 with Rolldown bundler and Oxc transforms_
