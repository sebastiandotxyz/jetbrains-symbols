# Symbols Icons for JetBrains

![Build](https://github.com/sebastiandotdev/symbols/workflows/Build/badge.svg)
[![Version](https://img.shields.io/jetbrains/plugin/v/MARKETPLACE_ID.svg)](https://plugins.jetbrains.com/plugin/MARKETPLACE_ID)
[![Downloads](https://img.shields.io/jetbrains/plugin/d/MARKETPLACE_ID.svg)](https://plugins.jetbrains.com/plugin/MARKETPLACE_ID)

A clean, minimal icon pack for JetBrains IDEs, based on `vscode-symbols`.

<!-- Plugin description -->
<h2>Symbols Icons for JetBrains</h2>
<p>A minimal file and folder icon theme for JetBrains IDEs.</p>
<p>Based on <a href="https://github.com/miguelsolorio/vscode-symbols">vscode-symbols</a> by Miguel Solorio.</p>
<!-- Plugin description end -->

## Preview

Preview image coming soon.

## Installation

- From JetBrains Marketplace: search for <strong>Symbols Icons</strong> and install.
- From disk: download the latest `.zip` from GitHub Releases and use <kbd>Install plugin from disk...</kbd>.

## Development

```zsh
deno task build
./gradlew --no-daemon test
./gradlew --no-daemon buildPlugin
```

## Release

```zsh
deno task build
git --no-pager diff --exit-code -- src/main/kotlin/com/github/sebastiandotdev/symbols/Icons.kt src/main/resources/symbols/icons
./gradlew --no-daemon test
./gradlew --no-daemon buildPlugin
```

---
Based on the [IntelliJ Platform Plugin Template](https://github.com/JetBrains/intellij-platform-plugin-template).
