import { copySync, ensureDirSync } from '@std/fs'
import { join } from '@std/path'

const SUBMODULE = '_submodules/vscode-symbols/src'
const ICONS_SRC = join(SUBMODULE, 'icons')
const THEME_JSON = join(SUBMODULE, 'symbol-icon-theme.json')
const ICONS_DEST = 'src/main/resources/symbols/icons'

const KOTLIN_OUTPUT = 'src/main/kotlin/com/github/sebastiandotdev/symbols/Icons.kt'
const KOTLIN_PACKAGE = 'com.github.sebastiandotdev.symbols'

const theme = JSON.parse(Deno.readTextFileSync(THEME_JSON))

const iconDefinitions: Record<string, { iconPath: string }> =
  theme.iconDefinitions
const fileExtensions: Record<string, string> = theme.fileExtensions
const fileNames: Record<string, string> = theme.fileNames

ensureDirSync(join(ICONS_DEST, 'files'))
ensureDirSync(join(ICONS_DEST, 'folders'))

const validIcons = new Set(Object.keys(iconDefinitions))

const folderEntries = Object.keys(iconDefinitions)
    .filter(name => name.startsWith("folder-"))
    .map(name => {
      const folderKey = name.replace("folder-", "") // "folder-android" → "android"
      const field = toKtFieldName(name)             // "folder-android" → "folder_android"
      return [folderKey, field] as [string, string]
    })

const validFileExtensions = Object.fromEntries(
  Object.entries(fileExtensions).filter(([_, icon]) => validIcons.has(icon))
)

const validFileNames = Object.fromEntries(
  Object.entries(fileNames).filter(([_, icon]) => validIcons.has(icon))
)

const orphans = [
  ...Object.entries(fileExtensions).filter(([_, icon]) => !validIcons.has(icon)),
  ...Object.entries(fileNames).filter(([_, icon]) => !validIcons.has(icon)),
]

if (orphans.length > 0) {
    console.warn(`⚠️  ${orphans.length} referencias sin SVG (ignoradas):`)
  orphans.forEach(([key, icon]) => console.warn(`   "${key}" → "${icon}"`))
}

copySync(join(ICONS_SRC, 'files'), join(ICONS_DEST, 'files'), {
  overwrite: true
})

copySync(join(ICONS_SRC, 'folders'), join(ICONS_DEST, 'folders'), {
  overwrite: true
})

normalizeSvgDimensions(join(ICONS_DEST, 'files'))
normalizeSvgDimensions(join(ICONS_DEST, 'folders'))

console.log('SVGs copied successfully!')

function normalizeSvgDimensions(dir: string): void {
  for (const entry of Deno.readDirSync(dir)) {
    if (!entry.isFile || !entry.name.endsWith('.svg')) continue

    const filePath = join(dir, entry.name)
    const content = Deno.readTextFileSync(filePath)

    const normalized = content
      .replace(/\swidth="[^"]*"/i, ' width="16"')
      .replace(/\sheight="[^"]*"/i, ' height="16"')

    if (normalized !== content) {
      Deno.writeTextFileSync(filePath, normalized)
    }
  }
}

function toKtFieldName(name: string): string {
  // "angular-component" → "angular_component"
  // "react-ts"          → "react_ts"
  const replaced = name.replaceAll("-", "_").replaceAll(".", "_");

  return /^\d/.test(replaced) ? `_${replaced}` : replaced;
}

function iconPathToResourcePath(iconPath: string): string {
  // "./icons/files/typescript.svg" → "/symbols/icons/files/typescript.svg"
  return iconPath.replace(".", "/symbols");
}

let kt = `package ${KOTLIN_PACKAGE}

import com.intellij.openapi.util.IconLoader
import javax.swing.Icon

object Icons {
`;

for (const [name, def] of Object.entries(iconDefinitions)) {
  const field    = toKtFieldName(name);
  const resPath  = iconPathToResourcePath(def.iconPath);
  kt += `    @JvmField val ${field}: Icon = IconLoader.getIcon("${resPath}", Icons::class.java)\n`;
}

kt += `\n    val EXT_TO_ICON: Map<String, Icon> = mapOf(\n`;
for (const [ext, iconName] of Object.entries(validFileExtensions)) {
  const field = toKtFieldName(iconName);
  kt += `        "${ext}" to ${field},\n`;
}
kt += `    )\n`;

kt += `\n    val FOLDER_TO_ICON: Map<String, Icon> = mapOf(\n`;
for (const [folderKey, field] of folderEntries) {
  kt += `        "${folderKey}" to ${field},\n`;
}
kt += `    )\n`;

kt += `\n    val FILE_TO_ICON: Map<String, Icon> = mapOf(\n`;
for (const [fileName, iconName] of Object.entries(validFileNames)) {
  const field = toKtFieldName(iconName);
  kt += `        "${fileName}" to ${field},\n`;
}
kt += `    )\n`;

kt += `}\n`;

Deno.writeTextFileSync(KOTLIN_OUTPUT, kt);

console.log("✅ Icons.kt generated successfully!");
console.log(`   → ${Object.keys(iconDefinitions).length} icons`);
console.log(`   → ${Object.keys(fileExtensions).length} extensions`);
console.log(`   → ${Object.keys(fileNames).length} file names`);
