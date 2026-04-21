# Vite Migration Guide - Step by Step Upgrade

## 📍 Current Setup

- **Vite**: 5.4.21 → Target: 8.x
- **@vitejs/plugin-react**: 4.7.0
- **Vitest**: ✅ 3.2.4 (already upgraded for compatibility)
- **@vitest/coverage-v8**: ✅ 3.2.4 (already upgraded for compatibility)
- **@vitest/ui**: ✅ 3.2.4 (already upgraded for compatibility)
- **Node.js requirement**: >=20 <=22 ✅ (already compatible)
- **Target**: Vite 8.x (latest) + compatible Vitest versions

## 🗺️ Upgrade Path

**Strategy**: Upgrade Vite and Vitest together for compatibility

1. **Vitest Upgrade 2.1.9 → 3.2.4**
2. **Vite 5.4.21 + Vitest 3.2.4 → Vite 6.x + Vitest 4.x**
3. **Vite 6.x + Vitest 4.x → Vite 7.x + Vitest 5.x**
4. **Vite 7.x + Vitest 5.x → Vite 8.x + Vitest 6.x**

---

## ✅ **Step 1: Vitest Upgrade 2.1.9 → 3.2.4 **

### Summary

**Vitest 2.1.9 → 3.2.4** ✅ Successfully upgraded on April 21, 2026

### Changes Made

- Updated `vitest` from 2.1.9 to 3.2.4
- Updated `@vitest/coverage-v8` from 2.1.9 to 3.2.4
- Updated `@vitest/ui` from 2.1.9 to 3.2.4

### Verification ✅

- **Tests**: All 67 tests passing across 14 test files
- **Duration**: 14.47s
- **Coverage**: Working with @vitest/coverage-v8 v3.2.4
- **UI**: Working with @vitest/ui v3.2.4

### Commands Used

```bash
# Dependencies updated in package.json to ^3.0.0
pnpm install
# Verification
npx vitest --version  # vitest/3.2.4
pnpm test  # All tests passing
```

---

## 🚀 **Step 2: Vite 5.4.21 + Vitest 3.2.4 → Vite 6.x + Vitest 4.x**

### Package Updates Required

```bash
# Upgrade Vite and related packages
pnpm update vite@^6.0.0 @vitejs/plugin-react@^4.0.0

# Upgrade Vitest to v4 for Vite 6 compatibility
pnpm update vitest@^4.0.0 @vitest/coverage-v8@^4.0.0 @vitest/ui@^4.0.0
```

### Vitest 3.2.4 → 4.x Changes

✅ **Already completed Vitest upgrade prep**: Vitest was pre-upgraded from 2.1.9 → 3.2.4 to prepare for this migration.

**Vitest 4.x new features**:

- Enhanced Vite 6 compatibility
- Improved workspace support
- Better TypeScript performance
- New assertion APIs

### Vite 5.4.21 → 6.x Changes

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

---

## 🚀 **Step 3: Vite 6.x + Vitest 4.x → Vite 7.x + Vitest 5.x**

### Package Updates Required

```bash
# Upgrade Vite
pnpm update vite@^7.0.0

# Upgrade Vitest to v5 for Vite 7 compatibility
pnpm update vitest@^5.0.0 @vitest/coverage-v8@^5.0.0 @vitest/ui@^5.0.0
```

### Vitest 4.x → 5.x Changes

**New Vitest 5.x features**:

- Enhanced Vite 7 compatibility
- Improved watch mode performance
- Better browser testing support
- Enhanced snapshot testing

### Vite 6.x → 7.x Changes

#### **1. Node.js Support** ✅

**Requirement**: Node.js 20.19+ / 22.12+ (was 18+)
**Status**: ✅ Already compatible (engines shows >=20 <=22)

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

- [ ] Verify Sass compilation works (modern API only)
- [ ] Test in target browsers
- [ ] Run full build and dev server tests
- [ ] Verify `npx vitest --version` shows v5.x
- [ ] Test Vitest 5.x new features
- [ ] Check for any deprecated plugin usage

---

## 🚀 **Step 4: Vite 7.x + Vitest 5.x → Vite 8.x + Vitest 6.x** ⚠️ **MAJOR CHANGES**

### Package Updates Required

```bash
# Upgrade Vite to v8
pnpm update vite@^8.0.0

# Upgrade Vitest to v6 for Vite 8 compatibility
pnpm update vitest@^6.0.0 @vitest/coverage-v8@^6.0.0 @vitest/ui@^6.0.0

# May need to install esbuild manually if fallback needed
pnpm add -D esbuild
```

### Vitest 5.x → 6.x Changes

**New Vitest 6.x features**:

- Full Vite 8 + Rolldown compatibility
- Support for Oxc transformations in test files
- Enhanced browser testing with Playwright integration
- Improved test parallelization
- Better TypeScript support with Oxc

**Breaking changes to watch for**:

- Some test environment configurations may need updates
- Coverage reporting improvements may change output format
- Browser testing setup may require adjustments

### Vite 7.x → 8.x Changes

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

**Change**: `import.meta.url` replaced with `undefined` instead of polyfill
**Solution**: Use `define` option if you need it:

```js
export default defineConfig({
  define: {
    'import.meta.url': '"undefined"',
  },
});
```

### Removed Features (No Migration Path)

- `build.rollupOptions.output.format: 'system'`
- `build.rollupOptions.output.format: 'amd'`
- Various Rollup hooks: `shouldTransformCachedModule`, `resolveImportMeta`, etc.
- Property mangling in minification

### Testing Checklist

- [ ] **Critical**: Test all imports, especially from node_modules
- [ ] Verify minification doesn't break your code
- [ ] Check CSS minification with Lightning CSS
- [ ] Test CommonJS module imports
- [ ] Verify build output size and format
- [ ] Test in all target browsers
- [ ] Check that all plugins still work

---

### **Potential Issues for Your React/TypeScript Project**

#### **Most Likely Issues**:

1. **Vite 6**: Sass modern API, JSON imports
2. **Vite 7**: Browser compatibility if targeting older versions
3. **Vite 8**: CommonJS imports (especially from node_modules), esbuild configs

#### **Dependencies to Watch**:

- **@edifice.io/** packages - check compatibility
- **MSW** (2.12.7) - should work but test service worker generation
- **React Hook Form** - check any esbuild-specific optimizations
- **Zustand** - verify store persistence works

### **Rollback Plan**

Keep your current `pnpm-lock.yaml` backed up:

```bash
cp pnpm-lock.yaml pnpm-lock.yaml.backup
# If issues arise:
cp pnpm-lock.yaml.backup pnpm-lock.yaml
pnpm install
```

---

## 📋 **Pre-Migration Checklist**

### **Before Starting**

- [ ] Backup `package.json` and `pnpm-lock.yaml`
- [ ] Ensure all tests pass on current version
- [ ] Document any custom build scripts or configurations
- [ ] Check if any dependencies have peer dependency requirements for Vite

### **Communication**

- [ ] Inform team about upcoming changes
- [ ] Plan for potential downtime during testing
- [ ] Prepare staging environment for testing

### **Monitoring**

- [ ] Note current bundle sizes for comparison
- [ ] Document current build times
- [ ] Test performance in development mode

---

## 🆘 **Troubleshooting Guide**

### **Common Vite 8 Issues**

#### **Import Errors**

```bash
# Error: Cannot resolve module
# Solution: Check if it's a CommonJS import issue
# Temporary fix: Add to legacy config
```

#### **Build Failures**

```bash
# Error: Oxc minification errors
# Solution: Switch to esbuild temporarily
build: { minify: 'esbuild' }
```

#### **Performance Regression**

```bash
# If builds are slower:
# 1. Check if using fallback options
# 2. Report to Vite team with minimal reproduction
```

### **Getting Help**

- [Vite Discord](https://chat.vitejs.dev/)
- [GitHub Issues](https://github.com/vitejs/vite/issues)
- [Migration Documentation](https://vite.dev/guide/migration.html)

---

## ✅ **Success Criteria**

After each step, verify:

- [ ] All builds complete without errors
- [ ] Development server starts correctly
- [ ] All tests pass
- [ ] Bundle sizes are reasonable
- [ ] Application works in target browsers
- [ ] No console errors in development or production
- [ ] Hot module replacement works correctly

---

_Last updated: April 21, 2026_
_Vite versions: 5.4.21 → 8.x_
