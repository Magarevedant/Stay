# Stay

**Stay** is a lightweight, browser-based file system library that uses IndexedDB to provide a simple, promise-based API for managing files and directories in the browser. It allows developers to create, read, write, delete, copy, move, and rename files, as well as list directory contents and retrieve file metadata. The library normalizes file paths, supports basic file operations, and is designed to be easy to integrate into web applications.

This README provides a detailed overview of the library, its API, setup instructions, and example use cases.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [init](#init)
  - [writeFile](#writefile)
  - [readFile](#readfile)
  - [deleteFile](#deletefile)
  - [listFiles](#listfiles)
  - [exists](#exists)
  - [stat](#stat)
  - [copy](#copy)
  - [move](#move)
  - [rename](#rename)
  - [all](#all)
- [Example Use Cases](#example-use-cases)
  - [Saving a Text File](#saving-a-text-file)
  - [Reading a File](#reading-a-file)
  - [Listing Files in a Directory](#listing-files-in-a-directory)
  - [Checking if a File Exists](#checking-if-a-file-exists)
  - [Copying a File](#copying-a-file)
  - [Moving a File](#moving-a-file)
  - [Renaming a File](#renaming-a-file)
  - [Getting All Files](#getting-all-files)
- [Error Handling](#error-handling)
- [Browser Compatibility](#browser-compatibility)
- [License](#license)

---

## Features

- **Simple File Operations**: Create, read, write, delete, copy, move, and rename files.
- **Directory Support**: List files in a directory and retrieve file metadata.
- **Path Normalization**: Automatically normalizes paths (e.g., `//path/to//file` → `/path/to/file`).
- **Promise-Based API**: All operations return promises for easy asynchronous handling.
- **Lightweight**: Built on IndexedDB, requiring no external dependencies.
- **File Metadata**: Tracks file name, path, size, type, creation, and update timestamps.
- **Persistent Storage**: Uses IndexedDB for persistent storage in the browser.

---

## Installation

1. **Include the Script**: Copy the provided JavaScript code into a file (e.g., `stay.min.js`) or include it directly in your project.

   ```html
   <script src="https://magarevedant.github.io/Stay/stay.min.js"></script>
   ```

2. **Use in Your Code**: The library exposes a global `Stay` object with all available methods. No additional setup is required.

3. **Optional Initialization**: Call `Stay.init()` to ensure the IndexedDB database is ready before performing operations.

   ```javascript
   await Stay.init();
   ```

---

## Usage

The library is accessible via the global `Stay` object. All methods are asynchronous and return promises. Below is a basic example to get started:

```javascript
(async () => {
  // Initialize the database
  await Stay.init();

  // Write a file
  await Stay.writeFile('/notes/note.txt', 'Hello, StayFS!');

  // Read the file
  const content = await Stay.readFile('/notes/note.txt');
  console.log(content); // Output: Hello, StayFS!

  // List files in a directory
  const files = await Stay.listFiles('/notes/');
  console.log(files); // Output: [{ name: 'note.txt', path: '/notes/note.txt', ... }]
})();
```

---

## API

### `init`

Initializes the IndexedDB database. This is automatically called by other methods but can be called explicitly to ensure the database is ready.

**Signature**:
```javascript
Stay.init(): Promise<void>
```

**Example**:
```javascript
await Stay.init();
console.log('Database initialized');
```

---

### `writeFile`

Writes content to a file at the specified path, creating or overwriting it.

**Signature**:
```javascript
Stay.writeFile(path: string, content: string): Promise<void>
```

**Parameters**:
- `path`: The file path (e.g., `/path/to/file.txt`).
- `content`: The content to write to the file.

**Example**:
```javascript
await Stay.writeFile('/documents/note.txt', 'This is a note.');
console.log('File saved');
```

---

### `readFile`

Reads the content of a file at the specified path.

**Signature**:
```javascript
Stay.readFile(path: string): Promise<string>
```

**Parameters**:
- `path`: The file path to read.

**Example**:
```javascript
const content = await Stay.readFile('/documents/note.txt');
console.log(content); // Output: This is a note.
```

---

### `deleteFile`

Deletes a file at the specified path.

**Signature**:
```javascript
Stay.deleteFile(path: string): Promise<void>
```

**Parameters**:
- `path`: The file path to delete.

**Example**:
```javascript
await Stay.deleteFile('/documents/note.txt');
console.log('File deleted');
```

---

### `listFiles`

Lists all files in a directory.

**Signature**:
```javascript
Stay.listFiles(directory: string = '/'): Promise<Array<{ name: string, path: string, size: number, type: string, createdAt: string, updatedAt: string }>>
```

**Parameters**:
- `directory`: The directory path (defaults to root `/`).

**Example**:
```javascript
const files = await Stay.listFiles('/documents/');
console.log(files); // Output: [{ name: 'note.txt', path: '/documents/note.txt', size: 15, type: 'file', createdAt: '...', updatedAt: '...' }]
```

---

### `exists`

Checks if a file exists at the specified path.

**Signature**:
```javascript
Stay.exists(path: string): Promise<boolean>
```

**Parameters**:
- `path`: The file path to check.

**Example**:
```javascript
const exists = await Stay.exists('/documents/note.txt');
console.log(exists); // Output: true or false
```

---

### `stat`

Retrieves metadata for a file at the specified path.

**Signature**:
```javascript
Stay.stat(path: string): Promise<{ name: string, path: string, size: number, type: string, createdAt: string, updatedAt: string }>
```

**Parameters**:
- `path`: The file path to get metadata for.

**Example**:
```javascript
const stats = await Stay.stat('/documents/note.txt');
console.log(stats); // Output: { name: 'note.txt', path: '/documents/note.txt', size: 15, type: 'file', createdAt: '...', updatedAt: '...' }
```

---

### `copy`

Copies a file from one path to another.

**Signature**:
```javascript
Stay.copy(source: string, destination: string): Promise<void>
```

**Parameters**:
- `source`: The source file path.
- `destination`: The destination file path.

**Example**:
```javascript
await Stay.copy('/documents/note.txt', '/backup/note.txt');
console.log('File copied');
```

---

### `move`

Moves a file from one path to another (copies and deletes the original).

**Signature**:
```javascript
Stay.move(source: string, destination: string): Promise<void>
```

**Parameters**:
- `source`: The source file path.
- `destination`: The destination file path.

**Example**:
```javascript
await Stay.move('/documents/note.txt', '/archive/note.txt');
console.log('File moved');
```

---

### `rename`

Renames a file (same as `move` but typically used for renaming within the same directory).

**Signature**:
```javascript
Stay.rename(source: string, destination: string): Promise<void>
```

**Parameters**:
- `source`: The source file path.
- `destination`: The new file path.

**Example**:
```javascript
await Stay.rename('/documents/note.txt', '/documents/note2.txt');
console.log('File renamed');
```

---

### `all`

Retrieves metadata for all files in the database.

**Signature**:
```javascript
Stay.all(): Promise<Array<{ name: string, path: string, size: number, type: string, createdAt: string, updatedAt: string }>>
```

**Example**:
```javascript
const allFiles = await Stay.all();
console.log(allFiles); // Output: [{ name: 'note.txt', path: '/documents/note.txt', ... }, ...]
```

---

## Example Use Cases

Below are simple examples demonstrating how to use StayFS for common tasks.

### Saving a Text File
```javascript
(async () => {
  await Stay.writeFile('/notes/hello.txt', 'Hello, World!');
  console.log('File saved');
})();
```

### Reading a File
```javascript
(async () => {
  const content = await Stay.readFile('/notes/hello.txt');
  console.log(content); // Output: Hello, World!
})();
```

### Listing Files in a Directory
```javascript
(async () => {
  await Stay.writeFile('/docs/file1.txt', 'Content 1');
  await Stay.writeFile('/docs/file2.txt', 'Content 2');
  const files = await Stay.listFiles('/docs/');
  console.log(files); // Output: [{ name: 'file1.txt', path: '/docs/file1.txt', ... }, { name: 'file2.txt', path: '/docs/file2.txt', ... }]
})();
```

### Checking if a File Exists
```javascript
(async () => {
  const exists = await Stay.exists('/notes/hello.txt');
  console.log(exists); // Output: true or false
})();
```

### Copying a File
```javascript
(async () => {
  await Stay.writeFile('/original.txt', 'Original content');
  await Stay.copy('/original.txt', '/copy.txt');
  const content = await Stay.readFile('/copy.txt');
  console.log(content); // Output: Original content
})();
```

### Moving a File
```javascript
(async () => {
  await Stay.writeFile('/source.txt', 'Source content');
  await Stay.move('/source.txt', '/destination.txt');
  const exists = await Stay.exists('/source.txt');
  console.log(exists); // Output: false
  const content = await Stay.readFile('/destination.txt');
  console.log(content); // Output: Source content
})();
```

### Renaming a File
```javascript
(async () => {
  await Stay.writeFile('/oldname.txt', 'Original name');
  await Stay.rename('/oldname.txt', '/newname.txt');
  const content = await Stay.readFile('/newname.txt');
  console.log(content); // Output: Original name
})();
```

### Getting All Files
```javascript
(async () => {
  await Stay.writeFile('/file1.txt', 'Content 1');
  await Stay.writeFile('/folder/file2.txt', 'Content 2');
  const allFiles = await Stay.all();
  console.log(allFiles); // Output: [{ name: 'file1.txt', path: '/file1.txt', ... }, { name: 'file2.txt', path: '/folder/file2.txt', ... }]
})();
```

---

## Error Handling

All methods throw errors if an operation fails. Use `try/catch` to handle errors gracefully.

**Example**:
```javascript
(async () => {
  try {
    const content = await Stay.readFile('/nonexistent.txt');
  } catch (error) {
    console.error(error.message); // Output: Failed to read file /nonexistent.txt: File not found: /nonexistent.txt
  }
})();
```

---

## Browser Compatibility

StayFS relies on IndexedDB, which is supported in all modern browsers, including:
- Chrome
- Firefox
- Safari
- Edge
- Most mobile browsers

Ensure your application runs in a browser that supports IndexedDB. For older browsers, you may need a polyfill.

---

## License

This project is licensed under the MIT License. Feel free to use, modify, and distribute it as needed.

---
