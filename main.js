
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const backend = require('./backend.js');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "DIRECT-optimizer advanced",
  });

  mainWindow.setMenu(null);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Uncomment to open DevTools on start
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  // --- IPC Handlers ---

  // Getters
  ipcMain.handle('get-system-info', () => backend.getSystemInfo());
  ipcMain.handle('get-tweaks', () => backend.getTweaks());
  ipcMain.handle('get-debloat-tasks', () => backend.getDebloatTasks());
  ipcMain.handle('get-cleanup-tasks', () => backend.getCleanupTasks());
  ipcMain.handle('get-backup-tasks', () => backend.getBackupTasks());
  ipcMain.handle('get-install-tasks', () => backend.getInstallTasks());

  // Apply Changes (Toggles)
  ipcMain.handle('apply-changes', async (event, changes) => {
    const errors = [];
    for (const [id, value] of Object.entries(changes)) {
      try {
        if (id.startsWith('debloat_')) {
          await backend.applyDebloat(id, value);
        } else { // Tweaks are also handled by applyTweak
          await backend.applyTweak(id, value);
        }
      } catch (e) {
        errors.push(`Failed to apply ${id}: ${e.message}`);
      }
    }
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
    return `Successfully applied ${Object.keys(changes).length} changes.`;
  });

  // Run Task (Actions)
  ipcMain.handle('run-task', async (event, id) => {
    if (id.startsWith('cleanup_')) {
      return backend.runCleanupTask(id);
    }
    if (id.startsWith('backup_')) {
      if (id === 'backup_registry') {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Save Registry Backup',
          defaultPath: `registry-backup-${Date.now()}.reg`,
          filters: [{ name: 'Registry Hive Files', extensions: ['reg'] }],
        });
        if (canceled || !filePath) return 'Registry backup cancelled by user.';
        return backend.runBackupTask(id, [filePath]);
      }
      return backend.runBackupTask(id, []);
    }
    if (id.startsWith('install_')) {
      return backend.installPackage(id);
    }
    // Action-based tweaks (System Repair) also use runTask
    if (id.startsWith('repair_')) {
      return backend.applyTweak(id, true);
    }
    throw new Error(`Unknown task ID: ${id}`);
  });


  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});