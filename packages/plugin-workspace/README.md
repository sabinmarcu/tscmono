# @tscmono/plugin-workspace

[![](https://img.shields.io/npm/v/@tscmono/plugin-workspace/latest)]() 
[![](https://img.shields.io/npm/v/@tscmono/plugin-workspace/nightly)]() 

[![](https://img.shields.io/bundlephobia/min/@tscmono/plugin-workspace)]()
[![](https://img.shields.io/bundlephobia/minzip/@tscmono/plugin-workspace)]()

[![](https://img.shields.io/npm/l/@tscmono/plugin-workspace)]() 
[![](https://img.shields.io/badge/developed%20with-Yarn%202-blue)](https://github.com/yarnpkg/berry)

## Project references

Generated custom configs, such as `tsconfig.build.json`, reference the matching
config in each dependency workspace using a path relative to the current
workspace. Dependency directories are preserved on both POSIX and Windows;
only the referenced config filename changes from `tsconfig.json`.
