

// stay.js - Enhanced Browser File System Library
const Stay = (() => {
  const DB_NAME = "StayFS";
  const STORE_NAME = "files";
  let db;

  // Open IndexedDB
  const init = () => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);

      req.onupgradeneeded = () => {
        const store = req.result.createObjectStore(STORE_NAME, { keyPath: "path" });
        store.createIndex("dir", "dir", { unique: false });
      };

      req.onsuccess = () => {
        db = req.result;
        resolve();
      };

      req.onerror = () => reject(req.error);
    });
  };

  // Utility functions
  const getDir = (path) => {
    const normalized = path.replace(/\/+/g, "/");
    return normalized.substring(0, normalized.lastIndexOf("/")) || "/";
  };

  const ensureInit = async () => db || await init();

  const normalizePath = (path) => {
    if (!path.startsWith("/")) path = "/" + path;
    return path.replace(/\/+/g, "/");
  };

  const isDirectory = (path) => path.endsWith("/");

  // Core file operations
  const writeFile = async (path, content) => {
    try {
      await ensureInit();
      path = normalizePath(path);
      
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const now = new Date().toISOString();

      const file = {
        path,
        name: path.split("/").pop(),
        dir: getDir(path),
        content: content || "",
        size: (content || "").length,
        type: "file",
        createdAt: now,
        updatedAt: now,
      };

      store.put(file);
      console.log(`💾 Saved: ${path}`);
      return tx.complete;
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error.message}`);
    }
  };

  const readFile = async (path) => {
    try {
      await ensureInit();
      path = normalizePath(path);
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(path);
        
        req.onsuccess = () => {
          if (req.result) resolve(req.result.content);
          else reject(new Error(`File not found: ${path}`));
        };
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error.message}`);
    }
  };

  const deleteFile = async (path) => {
    try {
      await ensureInit();
      path = normalizePath(path);
      
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(path);
      console.log(`🗑️ Deleted: ${path}`);
      return tx.complete;
    } catch (error) {
      throw new Error(`Failed to delete file ${path}: ${error.message}`);
    }
  };

  const listFiles = async (dir = "/") => {
    try {
      await ensureInit();
      dir = normalizePath(dir);
      if (!dir.endsWith("/")) dir += "/";
      
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const index = store.index("dir");
        const range = IDBKeyRange.only(dir);
        const results = [];
        
        index.openCursor(range).onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            results.push({
              name: cursor.value.name,
              path: cursor.value.path,
              size: cursor.value.size,
              type: cursor.value.type || "file",
              createdAt: cursor.value.createdAt,
              updatedAt: cursor.value.updatedAt,
            });
            cursor.continue();
          } else {
            resolve(results);
          }
        };
      });
    } catch (error) {
      throw new Error(`Failed to list files in ${dir}: ${error.message}`);
    }
  };

  const exists = async (path) => {
    try {
      await ensureInit();
      path = normalizePath(path);
      
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(path);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
      });
    } catch (error) {
      return false;
    }
  };

  const stat = async (path) => {
    try {
      await ensureInit();
      path = normalizePath(path);
      
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(path);
        
        req.onsuccess = () => {
          const file = req.result;
          if (!file) return reject(new Error(`File not found: ${path}`));
          
          resolve({
            name: file.name,
            path: file.path,
            size: file.size || file.content.length,
            type: file.type || "file",
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
          });
        };
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      throw new Error(`Failed to get file stats for ${path}: ${error.message}`);
    }
  };

  // Additional utility methods
  const mkdir = async (path) => {
    try {
      await ensureInit();
      path = normalizePath(path);
      if (!path.endsWith("/")) path += "/";
      
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const now = new Date().toISOString();

      const dir = {
        path,
        name: path.split("/").filter(Boolean).pop() || "root",
        dir: getDir(path),
        content: "",
        size: 0,
        type: "directory",
        createdAt: now,
        updatedAt: now,
      };

      store.put(dir);
      console.log(`📁 Created directory: ${path}`);
      return tx.complete;
    } catch (error) {
      throw new Error(`Failed to create directory ${path}: ${error.message}`);
    }
  };

  const copyFile = async (source, destination) => {
    try {
      const content = await readFile(source);
      await writeFile(destination, content);
      console.log(`📋 Copied: ${source} → ${destination}`);
    } catch (error) {
      throw new Error(`Failed to copy file from ${source} to ${destination}: ${error.message}`);
    }
  };

  const moveFile = async (source, destination) => {
    try {
      await copyFile(source, destination);
      await deleteFile(source);
      console.log(`🔄 Moved: ${source} → ${destination}`);
    } catch (error) {
      throw new Error(`Failed to move file from ${source} to ${destination}: ${error.message}`);
    }
  };

  const renameFile = async (oldPath, newPath) => {
    try {
      await moveFile(oldPath, newPath);
      console.log(`✏️ Renamed: ${oldPath} → ${newPath}`);
    } catch (error) {
      throw new Error(`Failed to rename file from ${oldPath} to ${newPath}: ${error.message}`);
    }
  };

  const appendFile = async (path, content) => {
    try {
      let existingContent = "";
      if (await exists(path)) {
        existingContent = await readFile(path);
      }
      await writeFile(path, existingContent + content);
      console.log(`➕ Appended to: ${path}`);
    } catch (error) {
      throw new Error(`Failed to append to file ${path}: ${error.message}`);
    }
  };

  const readLines = async (path) => {
    try {
      const content = await readFile(path);
      return content.split('\n');
    } catch (error) {
      throw new Error(`Failed to read lines from ${path}: ${error.message}`);
    }
  };

  const writeLines = async (path, lines) => {
    try {
      const content = Array.isArray(lines) ? lines.join('\n') : lines;
      await writeFile(path, content);
      console.log(`📝 Wrote lines to: ${path}`);
    } catch (error) {
      throw new Error(`Failed to write lines to ${path}: ${error.message}`);
    }
  };

  const getFileSize = async (path) => {
    try {
      const stats = await stat(path);
      return stats.size;
    } catch (error) {
      throw new Error(`Failed to get file size for ${path}: ${error.message}`);
    }
  };

  const getAllFiles = async () => {
    try {
      await ensureInit();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const results = [];
        
        store.openCursor().onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            results.push({
              name: cursor.value.name,
              path: cursor.value.path,
              size: cursor.value.size,
              type: cursor.value.type || "file",
              createdAt: cursor.value.createdAt,
              updatedAt: cursor.value.updatedAt,
            });
            cursor.continue();
          } else {
            resolve(results);
          }
        };
      });
    } catch (error) {
      throw new Error(`Failed to get all files: ${error.message}`);
    }
  };

  const clear = async () => {
    try {
      await ensureInit();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      console.log("🧹 Cleared all files");
      return tx.complete;
    } catch (error) {
      throw new Error(`Failed to clear all files: ${error.message}`);
    }
  };

  const search = async (query) => {
    try {
      const files = await getAllFiles();
      const results = files.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase()) ||
        file.path.toLowerCase().includes(query.toLowerCase())
      );
      return results;
    } catch (error) {
      throw new Error(`Failed to search for "${query}": ${error.message}`);
    }
  };

  // Helper methods for beginners
  const save = (path, content) => writeFile(path, content);
  const load = (path) => readFile(path);
  const remove = (path) => deleteFile(path);
  const list = (dir) => listFiles(dir);
  const copy = (source, dest) => copyFile(source, dest);
  const move = (source, dest) => moveFile(source, dest);
  const rename = (oldPath, newPath) => renameFile(oldPath, newPath);

  // Export all methods
  return {
    // Core operations
    writeFile,
    readFile,
    deleteFile,
    listFiles,
    exists,
    stat,
    
    // Directory operations
    mkdir,
    
    // File operations
    copyFile,
    moveFile,
    renameFile,
    appendFile,
    
    // Content operations
    readLines,
    writeLines,
    
    // Utility operations
    getFileSize,
    getAllFiles,
    clear,
    search,
    
    // Beginner-friendly aliases
    save,
    load,
    remove,
    list,
    copy,
    move,
    rename,
    
    // Direct access to init for manual initialization
    init,
  };
})();

// Usage examples for beginners:
/*
// Initialize (optional - happens automatically)
await Stay.init();

// Basic file operations
await Stay.save('/hello.txt', 'Hello World!');
const content = await Stay.load('/hello.txt');
console.log(content); // "Hello World!"

// Create directories
await Stay.mkdir('/documents/');
await Stay.mkdir('/images/photos/');

// List files
const files = await Stay.list('/');
console.log(files);

// Copy and move files
await Stay.copy('/hello.txt', '/documents/hello-copy.txt');
await Stay.move('/hello.txt', '/documents/hello-moved.txt');

// Append to files
await Stay.appendFile('/log.txt', 'New log entry\n');

// Work with lines
await Stay.writeLines('/list.txt', ['Item 1', 'Item 2', 'Item 3']);
const lines = await Stay.readLines('/list.txt');

// Search files
const results = await Stay.search('hello');

// Check if file exists
if (await Stay.exists('/config.json')) {
  const config = await Stay.load('/config.json');
}

// Get file information
const stats = await Stay.stat('/hello.txt');
console.log(stats.size, stats.createdAt);

// Clear all files
await Stay.clear();
*/