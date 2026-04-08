package com.github.sebastiandotdev.symbols

import com.intellij.ide.IconProvider
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.psi.PsiElement
import com.intellij.psi.util.PsiUtilCore
import javax.swing.Icon

class IconProvider : IconProvider() {
  
  override fun getIcon(element: PsiElement, flags: Int): Icon? {
    val virtualFile = PsiUtilCore.getVirtualFile(element)
    
    return findIcon(virtualFile)
  }
  
  private fun findIcon(virtualFile: VirtualFile?): Icon? {
    return when {
      virtualFile?.isDirectory == true -> Icons.FOLDER_TO_ICON[virtualFile.name.lowercase()]
        ?: Icons.folder
      
      else -> findFileIcon(virtualFile)
    }
  }
  
  private fun findFileIcon(virtualFile: VirtualFile?): Icon? {
    val fileName = virtualFile?.name?.lowercase()
    
    return Icons.FILE_TO_ICON[fileName]
      ?: findExtensionIcon(fileName)
  }
  
  private fun findExtensionIcon(fileName: String?): Icon? {
    if (fileName == null) return null
    
    // We want to check for "test.tsx", "tsx" and "ts" extensions in that order.
    // 1. "test.tsx"
    // 2. "tsx"
    val parts = fileName.split(".")
    for (i in parts.indices) {
      val ext = parts.subList(i, parts.size).joinToString(".")
      Icons.EXT_TO_ICON[ext]?.let { return it }
    }
    return null
  }
}
