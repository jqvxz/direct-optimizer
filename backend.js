
const { exec } = require('child_process');
const { promisify } = require('util');
const si = require('systeminformation');
const WinReg = require('winreg');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

// --- Utils ---
const execAsync = promisify(exec);

async function runCommand(program, args) {
  try {
    const commandLine = [program, ...args].join(' ');
    const { stdout, stderr } = await execAsync(commandLine, { shell: 'powershell.exe' });
    if (stderr) {
      console.error(`[${program}] STDERR: ${stderr}`);
    }
    return stdout;
  } catch (error) {
    console.error(`Error executing command: ${program} ${args.join(' ')}`, error);
    throw new Error(`Command failed: ${program} ${args.join(' ')}\n${error.stderr || error.message}`);
  }
}

async function runPowershell(script) {
    const encodedScript = Buffer.from(script, 'utf16le').toString('base64');
    return runCommand('powershell', ['-ExecutionPolicy', 'Bypass', '-NoProfile', '-EncodedCommand', encodedScript]);
}

async function checkPowershellCondition(script) {
  try {
    const output = await runPowershell(script);
    return output?.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// --- System Info ---
async function getSystemInfo() {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const fsDisks = await si.fsSize();
    const osInfo = await si.osInfo();

    const primaryDisk = fsDisks.find(d => d.mount.toUpperCase() === 'C:') || fsDisks[0] || { size: 0, used: 0 };
    
    return {
      cpuUsage: cpu.currentLoad,
      ramUsage: (mem.used / (1024 * 1024 * 1024)),
      ramTotal: (mem.total / (1024 * 1024 * 1024)),
      diskUsage: primaryDisk.used,
      diskTotal: primaryDisk.size,
      os: `${osInfo.distro} ${osInfo.release}`,
    };
  } catch (e) {
    console.error('Failed to get system info:', e);
    throw new Error(`Failed to get system info: ${e.message}`);
  }
}


// --- Tweaks ---
const TweakCategory = { Performance: 'Performance', Privacy: 'Privacy', UI: 'UI', Network: 'Network', Advanced: 'Advanced', SystemRepair: 'System Repair' };
const getAllTweaks = () => [
    { id: "perf_visual_effects", name: "Adjust for Best Performance", description: "Disables visual effects like animations and shadows.", category: TweakCategory.Performance, type: "toggle" },
    { id: "perf_power_plan", name: "Ultimate Performance Power Plan", description: "Sets the power plan to favor maximum performance.", category: TweakCategory.Performance, type: "toggle" },
    { id: "perf_compatibility_assistant", name: "Disable Program Compatibility Assistant", description: "Prevents Windows from checking for program compatibility issues.", category: TweakCategory.Performance, type: "toggle" },
    { id: "adv_cpu_priority", name: "Optimize CPU Priority for Foreground Apps", description: "Allocates more CPU resources to the active application.", category: TweakCategory.Advanced, type: "toggle" },
    { id: "net_nagle_algorithm", name: "Disable Nagle's Algorithm", description: "Reduces latency in some online games and applications by sending packets sooner.", category: TweakCategory.Network, type: "toggle" },
    { id: "privacy_telemetry", name: "Disable Telemetry Services", description: "Stops Windows from collecting and sending usage data to Microsoft.", category: TweakCategory.Privacy, type: "toggle" },
    { id: "privacy_ad_id", name: "Disable Advertising ID", description: "Prevents apps from using your advertising ID for personalized ads.", category: TweakCategory.Privacy, type: "toggle" },
    { id: "privacy_search_suggestions", name: "Disable Search Box Suggestions", description: "Prevents Windows Search from showing web suggestions.", category: TweakCategory.Privacy, type: "toggle" },
    { id: "privacy_error_reporting", name: "Disable Error Reporting", description: "Stops Windows from prompting to send error reports.", category: TweakCategory.Privacy, type: "toggle" },
    { id: "ui_show_file_ext", name: "Show File Extensions", description: "Makes file extensions (e.g., .txt, .exe) visible.", category: TweakCategory.UI, type: "toggle" },
    { id: "ui_dark_mode", name: "Enable Dark Mode", description: "Sets the default app and system theme to dark.", category: TweakCategory.UI, type: "toggle" },
    { id: "ui_sticky_keys", name: "Disable Sticky Keys Prompt", description: "Disables the accessibility feature popup for Sticky Keys, etc.", category: TweakCategory.UI, type: "toggle" },
    { id: "adv_disable_win_update", name: "Disable Windows Update Service", description: "Stops the Windows Update service from running. Warning: This will prevent security updates.", category: TweakCategory.Advanced, type: "toggle" },
    { id: "adv_remote_registry", name: "Disable Remote Registry Service", description: "Disables the service that allows remote users to modify registry settings.", category: TweakCategory.Advanced, type: "toggle" },
    { id: "adv_remote_management", name: "Disable Remote Management (WinRM)", description: "Disables the service for remote command-line administration.", category: TweakCategory.Advanced, type: "toggle" },
    { id: "repair_flush_dns", name: "Flush DNS Cache", description: "Clears the local DNS resolver cache (ipconfig /flushdns).", category: TweakCategory.SystemRepair, type: "action" },
    { id: "repair_reset_winsock", name: "Reset Network Adapter (Winsock)", description: "Resets the Winsock Catalog to fix network issues (netsh winsock reset).", category: TweakCategory.SystemRepair, type: "action" },
    { id: "repair_reset_ip", name: "Reset TCP/IP Stack", description: "Resets the TCP/IP stack to its default state (netsh int ip reset).", category: TweakCategory.SystemRepair, type: "action" },
    { id: "repair_renew_ip", name: "Release & Renew IP Address", description: "Gets a new IP address from your router (ipconfig /release & /renew).", category: TweakCategory.SystemRepair, type: "action" },
    { id: "repair_reset_firewall", name: "Reset Windows Firewall", description: "Restores Windows Firewall settings to their default configuration.", category: TweakCategory.SystemRepair, type: "action" },
    { id: "repair_restart_explorer", name: "Restart Windows Explorer", description: "Terminates and restarts the explorer.exe process to fix shell issues.", category: TweakCategory.SystemRepair, type: "action" },
    { id: "repair_restart_audio", name: "Restart Audio Service", description: "Restarts the Windows Audio service to resolve sound problems.", category: TweakCategory.SystemRepair, type: "action" },
    { id: "repair_sfc_scan", name: "Run System File Check", description: "Scans and repairs protected system files (sfc /scannow). This may take a while.", category: TweakCategory.SystemRepair, type: "action" },
    { id: "perf_disk_defrag", name: "Disable Automatic Disk Defragmentation", description: "Prevents scheduled defragmentation on SSDs, which is unnecessary and can reduce their lifespan.", category: TweakCategory.Performance, type: "toggle" },
    { id: "perf_superfetch", name: "Disable Superfetch/SysMain Service", description: "Stops the service that pre-loads frequently used apps into RAM. Can sometimes cause performance issues on systems with SSDs or limited RAM.", category: TweakCategory.Performance, type: "toggle" },
    { id: "net_tcp_no_delay", name: "Enable TCP NoDelay", description: "An advanced network tweak that can reduce latency by preventing TCP from waiting for a full packet before sending.", category: TweakCategory.Network, type: "toggle" },
    { id: "privacy_cortana", name: "Disable Cortana", description: "Disables the Cortana digital assistant and its background processes.", category: TweakCategory.Privacy, type: "toggle" },
    { id: "privacy_feedback_diagnostics", name: "Disable Feedback & Diagnostics", description: "Stops Windows from sending detailed diagnostic and usage data.", category: TweakCategory.Privacy, type: "toggle" },
    { id: "ui_taskbar_search_icon", name: "Hide Taskbar Search Icon", description: "Removes the search icon from the taskbar to free up space.", category: TweakCategory.UI, type: "toggle" },
    { id: "ui_remove_3d_objects", name: "Remove 3D Objects Folder", description: "Hides the '3D Objects' folder from 'This PC' in File Explorer.", category: TweakCategory.UI, type: "toggle" },
    { id: "adv_disable_p2p_updates", name: "Disable P2P Windows Updates", description: "Prevents your PC from uploading Windows updates to other computers on the internet.", category: TweakCategory.Advanced, type: "toggle" },
    { id: "adv_legacy_components", name: "Disable Legacy Components Service", description: "Disables the service that supports older, non-Microsoft components. Can be useful if you're not using any.", category: TweakCategory.Advanced, type: "toggle" },
    { id: "adv_disable_print_spooler", name: "Disable Print Spooler Service", description: "Disables the print spooler service. Warning: This will prevent you from printing anything.", category: TweakCategory.Advanced, type: "toggle" },
];
const setRegKeyValue = async (hive, path, key, value, type = WinReg.REG_DWORD) => {
    const regKey = new WinReg({ hive, key: path });
    await new Promise((resolve, reject) => {
        // Ensure the key is created before setting the value
        regKey.keyExists((err, exists) => {
            if (err) return reject(err);
            if (!exists) {
                regKey.create((err) => {
                    if (err) return reject(err);
                    regKey.set(key, type, value.toString(), (err) => err ? reject(err) : resolve());
                });
            } else {
                 regKey.set(key, type, value.toString(), (err) => err ? reject(err) : resolve());
            }
        });
    });
};
async function getTweaks() {
    // Set all tweak options to 'off' by default.
    return getAllTweaks().map(tweak => ({
        ...tweak,
        applied: false
    }));
}
async function applyTweak(id, value) {
    switch (id) {
        case "perf_visual_effects": await setRegKeyValue(WinReg.HKCU, '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects', 'VisualFXSetting', value ? 2 : 1); break;
        case "perf_power_plan": await runCommand('powercfg', ['/setactive', value ? 'e9a42b02-d5df-448d-aa00-03f14749eb61' : '381b4222-f694-41f0-9685-ff5bb260df2e']); break;
        case "perf_compatibility_assistant": await setRegKeyValue(WinReg.HKLM, '\\SOFTWARE\\Policies\\Microsoft\\Windows\\AppCompat', 'DisablePCA', value ? 1 : 0); break;
        case "adv_cpu_priority": await setRegKeyValue(WinReg.HKLM, '\\SYSTEM\\CurrentControlSet\\Control\\PriorityControl', 'Win32PrioritySeparation', value ? 38 : 2); break;
        case "net_nagle_algorithm":
            const script = value ?
                "Get-NetAdapter | ForEach-Object { Set-ItemProperty -Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\$($_.InterfaceGuid)\" -Name TcpAckFrequency -Value 1 -Force; Set-ItemProperty -Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\$($_.InterfaceGuid)\" -Name TCPNoDelay -Value 1 -Force }"
                : "Get-NetAdapter | ForEach-Object { if (Get-ItemProperty -Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\$($_.InterfaceGuid)\" -Name TcpAckFrequency -ErrorAction SilentlyContinue) { Remove-ItemProperty -Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\$($_.InterfaceGuid)\" -Name TcpAckFrequency -ErrorAction SilentlyContinue }; if (Get-ItemProperty -Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\$($_.InterfaceGuid)\" -Name TCPNoDelay -ErrorAction SilentlyContinue) { Remove-ItemProperty -Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\\$($_.InterfaceGuid)\" -Name TCPNoDelay -ErrorAction SilentlyContinue } }";
            await runPowershell(script); break;
        case "privacy_telemetry": await setRegKeyValue(WinReg.HKLM, '\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection', 'AllowTelemetry', value ? 0 : 1); break;
        case "privacy_ad_id": await setRegKeyValue(WinReg.HKCU, '\\Software\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo', 'Enabled', value ? 0 : 1); break;
        case "privacy_search_suggestions": await setRegKeyValue(WinReg.HKCU, '\\Software\\Policies\\Microsoft\\Windows\\Explorer', 'DisableSearchBoxSuggestions', value ? 1 : 0); break;
        case "privacy_error_reporting": await setRegKeyValue(WinReg.HKLM, '\\SOFTWARE\\Microsoft\\Windows\\Windows Error Reporting', 'Disabled', value ? 1 : 0); break;
        case "ui_show_file_ext": await setRegKeyValue(WinReg.HKCU, '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced', 'HideFileExt', value ? 0 : 1); break;
        case "ui_dark_mode":
            await setRegKeyValue(WinReg.HKCU, '\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize', 'AppsUseLightTheme', value ? 0 : 1);
            await setRegKeyValue(WinReg.HKCU, '\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize', 'SystemUsesLightTheme', value ? 0 : 1); break;
        case "ui_sticky_keys": await setRegKeyValue(WinReg.HKCU, '\\Control Panel\\Accessibility\\StickyKeys', 'Flags', value ? 506 : 511); break;
        case "adv_disable_win_update": await runCommand('sc.exe', ['config', 'wuauserv', 'start=', value ? 'disabled' : 'auto']); break;
        case "adv_remote_registry": await runCommand('sc.exe', ['config', 'RemoteRegistry', 'start=', value ? 'disabled' : 'auto']); break;
        case "adv_remote_management": await runCommand('sc.exe', ['config', 'WinRM', 'start=', value ? 'disabled' : 'auto']); break;
        case "repair_flush_dns": return await runCommand('ipconfig', ['/flushdns']);
        case "repair_reset_winsock": return await runCommand('netsh', ['winsock', 'reset']);
        case "repair_reset_ip": return await runCommand('netsh', ['int', 'ip', 'reset']);
        case "repair_renew_ip": return await runCommand('ipconfig', ['/release', '&&', 'ipconfig', '/renew']);
        case "repair_reset_firewall": return await runPowershell('netsh advfirewall reset');
        case "repair_restart_explorer": return await runPowershell('Stop-Process -Name explorer -Force; Start-Process explorer');
        case "repair_restart_audio": return await runPowershell('net stop Audiosrv; net start Audiosrv');
        case "repair_sfc_scan": return await runCommand('sfc', ['/scannow']);
        case "perf_disk_defrag": await setRegKeyValue(WinReg.HKLM, '\\SOFTWARE\\Microsoft\\Dfrg\\BootOptimizeFunction', 'Enable', value ? 'N' : 'Y'); break;
        case "perf_superfetch": await runCommand('sc.exe', ['config', 'SysMain', 'start=', value ? 'disabled' : 'auto']); break;
        case "net_tcp_no_delay": await setRegKeyValue(WinReg.HKLM, '\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters', 'TcpNoDelay', value ? 1 : 0); break;
        case "privacy_cortana": await setRegKeyValue(WinReg.HKLM, '\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search', 'AllowCortana', value ? 0 : 1); break;
        case "privacy_feedback_diagnostics": await setRegKeyValue(WinReg.HKLM, '\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection', 'AllowTelemetry', value ? 0 : 1); break;
        case "ui_taskbar_search_icon": await setRegKeyValue(WinReg.HKCU, '\\Software\\Microsoft\\Windows\\CurrentVersion\\Search', 'SearchboxTaskbarMode', value ? 0 : 1); break;
        case "ui_remove_3d_objects": await setRegKeyValue(WinReg.HKLM, '\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\MyComputer\\NameSpace\\{047F4690-C1B5-442B-B9ED-44754728560F}', '@', value ? '' : '3D Objects'); break;
        case "adv_disable_p2p_updates": await setRegKeyValue(WinReg.HKLM, '\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\DeliveryOptimization\\Config', 'DoDownloadMode', value ? 0 : 3); break;
        case "adv_legacy_components": await runCommand('sc.exe', ['config', 'WdiServiceHost', 'start=', value ? 'disabled' : 'auto']); break;
        case "adv_disable_print_spooler": await runCommand('sc.exe', ['config', 'Spooler', 'start=', value ? 'disabled' : 'auto']); break;
        default: throw new Error(`Unknown tweak ID: ${id}`);
    }
    return `Applied tweak ${id} with value ${value}`;
}


// --- Debloat ---
const DebloatCategory = { DefinitelyRecommended: 'Definitely Recommended', MicrosoftApps: 'Microsoft Apps', GamesAndEntertainment: 'Games & Entertainment' };
const getAppxPackageList = () => [
    { id: "debloat_mcafee", name: "McAfee Antivirus", description: "Removes McAfee trial software.", danger: 'No', category: DebloatCategory.DefinitelyRecommended },
    { id: "debloat_norton", name: "Norton Antivirus", description: "Removes Norton trial software.", danger: 'No', category: DebloatCategory.DefinitelyRecommended },
    { id: "debloat_cortana", name: "Cortana", description: "Removes the Cortana personal assistant.", danger: 'Low', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_onedrive", name: "OneDrive", description: "Removes OneDrive cloud storage integration.", danger: 'Medium', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_onenote", name: "OneNote", description: "Removes OneNote for Windows 10.", danger: 'Low', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_skype", name: "Skype", description: "Removes the pre-installed Skype app.", danger: 'Low', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_3dviewer", name: "3D Viewer", description: "Removes the 3D model viewer application.", danger: 'Low', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_paint3d", name: "Paint 3D", description: "Removes the modern Paint 3D application.", danger: 'Low', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_mixedreality", name: "Mixed Reality Portal", description: "Removes the portal for Windows Mixed Reality.", danger: 'Low', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_people", name: "People App", description: "Removes the People app for contact management.", danger: 'Low', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_news", name: "News", description: "Removes the News widget and application.", danger: 'Low', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_weather", name: "Weather", description: "Removes the Weather widget and application.", danger: 'Low', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_movies_tv", name: "Movies & TV", description: "Removes the default video player app.", danger: 'Low', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_groove", name: "Groove Music", description: "Removes the default music player app.", danger: 'Low', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_mail_calendar", name: "Mail & Calendar", description: "Removes the default Mail and Calendar apps.", danger: 'Medium', category: DebloatCategory.MicrosoftApps },
    { id: "debloat_gamebar", name: "Xbox Game Bar", description: "Disables the Xbox Game Bar.", danger: 'Medium', category: DebloatCategory.GamesAndEntertainment },
    { id: "debloat_xbox_companion", name: "Xbox Console Companion", description: "Removes the Xbox app.", danger: 'Low', category: DebloatCategory.GamesAndEntertainment },
    { id: "debloat_solitaire", name: "Microsoft Solitaire Collection", description: "Removes the Solitaire card game collection.", danger: 'Low', category: DebloatCategory.GamesAndEntertainment },
];
const getPackageNameForId = (id) => ({ "debloat_mcafee": "*McAfee*", "debloat_norton": "*Norton*", "debloat_cortana": "*Microsoft.549981C3F5F10*", "debloat_onedrive": "*Microsoft.OneDriveSync*", "debloat_onenote": "*Microsoft.Office.OneNote*", "debloat_skype": "*Microsoft.SkypeApp*", "debloat_3dviewer": "*Microsoft.3DViewer*", "debloat_paint3d": "*Microsoft.Paint3D*", "debloat_mixedreality": "*Microsoft.MixedReality.Portal*", "debloat_people": "*Microsoft.People*", "debloat_news": "*Microsoft.BingNews*", "debloat_weather": "*Microsoft.BingWeather*", "debloat_movies_tv": "*Microsoft.ZuneVideo*", "debloat_groove": "*Microsoft.ZuneMusic*", "debloat_mail_calendar": "*microsoft.windowscommunicationsapps*", "debloat_gamebar": "*Microsoft.XboxGamingOverlay*", "debloat_xbox_companion": "*Microsoft.XboxApp*", "debloat_solitaire": "*Microsoft.MicrosoftSolitaireCollection*", }[id] || '');
async function getDebloatTasks() {
    // Set all debloat options to 'off' by default. 'applied: false' means not removed.
    return getAppxPackageList().map(task => ({
        ...task,
        applied: false
    }));
}
async function applyDebloat(id, value) {
    const packageName = getPackageNameForId(id);
    if (!packageName) throw new Error(`Unknown debloat ID: ${id}`);
    const script = value
        ? `Get-AppxPackage -Name '${packageName}' -AllUsers | Remove-AppxPackage -AllUsers`
        : `Get-AppxPackage -Name '${packageName}' -AllUsers | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\\AppXManifest.xml"}`;
    await runPowershell(script);
    return `Applied debloat for ${id} with value ${value}`;
}


// --- Cleanup ---
const getCleanupTasks = () => [
    { id: "cleanup_temp", name: "Temporary Files", description: "Remove temporary files from Windows and applications." },
    { id: "cleanup_recycle", name: "Empty Recycle Bin", description: "Permanently delete all items in the Recycle Bin." },
    { id: "cleanup_thumbnails", name: "Thumbnail Cache", description: "Clear the cache of file and image thumbnails." },
    { id: "cleanup_updates", name: "Windows Update Cache", description: "Remove old downloaded Windows Update files." },
    { id: "cleanup_disk_cleanup", name: "Run Disk Cleanup Utility", description: "Opens the built-in Windows Disk Cleanup tool (cleanmgr)." },
    { id: "cleanup_clear_arp", name: "Clear ARP Cache", description: "Removes dynamic entries from the Address Resolution Protocol cache." },
];
async function clearTempFiles() {
    const tempDir = os.tmpdir();
    let deletedCount = 0, errorCount = 0;
    const entries = await fs.readdir(tempDir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(tempDir, entry.name);
        try {
            await fs.rm(fullPath, { recursive: true, force: true });
            deletedCount++;
        } catch (error) {
            errorCount++;
        }
    }
    return `Cleared ${deletedCount} files/folders. ${errorCount} files were in use.`;
}
async function emptyRecycleBin() {
    await runPowershell("Clear-RecycleBin -Force -ErrorAction SilentlyContinue");
    return "Recycle Bin emptied.";
}
async function clearThumbnailCache() {
    await runPowershell("Stop-Process -Name explorer -Force -EA 0; Get-ChildItem '$env:localappdata\\Microsoft\\Windows\\Explorer\\thumbcache_*.db' | Remove-Item -Force -EA 0; Start-Process explorer");
    return "Thumbnail cache cleared and Explorer restarted.";
}
async function clearWindowsUpdateCache() {
    await runPowershell("net stop wuauserv; Remove-Item '$env:windir\\SoftwareDistribution' -Recurse -Force -EA 0; net start wuauserv");
    return "Windows Update cache cleared and service restarted.";
}
async function clearArpCache() {
    await runCommand('arp', ['-d', '*']);
    return "ARP cache cleared.";
}
async function runCleanupTask(id) {
    switch (id) {
        case "cleanup_temp": return await clearTempFiles();
        case "cleanup_recycle": return await emptyRecycleBin();
        case "cleanup_thumbnails": return await clearThumbnailCache();
        case "cleanup_updates": return await clearWindowsUpdateCache();
        case "cleanup_disk_cleanup": await runCommand('cleanmgr', []); return "Disk Cleanup utility opened.";
        case "cleanup_clear_arp": return await clearArpCache();
        default: throw new Error(`Unknown cleanup task: ${id}`);
    }
}


// --- Backup ---
const getBackupTasks = () => [
    { id: "backup_registry", name: "Backup Registry", description: "Creates a backup of the current Windows Registry hives." },
    { id: "backup_create_restore", name: "Create Restore Point", description: "Creates a system restore point to revert to if needed." },
];
async function createRestorePoint() {
    try {
        await runPowershell("Checkpoint-Computer -Description \"DIRECT-optimizer Backup\" -RestorePointType 'MODIFY_SETTINGS'");
        return "System Restore Point created successfully.";
    } catch (e) {
        throw new Error(`Failed to create restore point. Ensure you run as Administrator. Error: ${e.message}`);
    }
}
async function backupRegistry(filePath) {
    if (!filePath) return "Registry backup cancelled.";
    const hives = ["HKCU", "HKLM", "HKCR", "HKU", "HKCC"];
    const errors = [];
    const baseFilePath = filePath.endsWith('.reg') ? filePath.slice(0, -4) : filePath;
    for (const hive of hives) {
        const fileName = `${baseFilePath}_${hive}.reg`;
        try {
            await runCommand("reg", ["export", hive, `"${fileName}"`, "/y"]);
        } catch (error) {
            errors.push(`Failed to back up ${hive}: ${error.message}`);
        }
    }
    if (errors.length === 0) return `Registry backup completed successfully to ${path.dirname(filePath)}`;
    else throw new Error(`Registry backup completed with errors: ${errors.join(", ")}`);
}
async function runBackupTask(id, args) {
    switch (id) {
        case "backup_create_restore": return await createRestorePoint();
        case "backup_registry": return await backupRegistry(args[0]);
        default: throw new Error(`Unknown backup task: ${id}`);
    }
}


// --- Install ---
const InstallCategory = { Utilities: 'Utilities', Browsers: 'Browsers', Productivity: 'Productivity', DeveloperTools: 'Developer Tools' };
const baseInstallTasks = () => [
    { id: "install_7zip", name: "7-Zip", description: "A free and open-source file archiver with a high compression ratio.", category: InstallCategory.Utilities },
    { id: "install_powertoys", name: "Microsoft PowerToys", description: "A set of utilities for power users to tune and streamline their Windows experience.", category: InstallCategory.Utilities },
    { id: "install_rufus", name: "Rufus", description: "A utility that helps format and create bootable USB flash drives.", category: InstallCategory.Utilities },
    { id: "install_vlc", name: "VLC Media Player", description: "A versatile multimedia player that plays most multimedia files.", category: InstallCategory.Utilities },
    { id: "install_brave", name: "Brave Browser", description: "A privacy-focused browser that blocks ads and trackers by default.", category: InstallCategory.Browsers },
    { id: "install_firefox", name: "Firefox Browser", description: "A popular open-source web browser developed by the Mozilla Foundation.", category: InstallCategory.Browsers },
    { id: "install_libreoffice", name: "LibreOffice", description: "A powerful and free office suite, a successor to OpenOffice.org.", category: InstallCategory.Productivity },
    { id: "install_obsidian", name: "Obsidian", description: "A powerful knowledge base on top of a local folder of plain text Markdown files.", category: InstallCategory.Productivity },
    { id: "install_vscode", name: "Visual Studio Code", description: "A lightweight but powerful source code editor.", category: InstallCategory.DeveloperTools },
    { id: "install_git", name: "Git for Windows", description: "The official build of Git for Windows.", category: InstallCategory.DeveloperTools },
];
const getPackageId = (installId) => ({ "install_7zip": "7zip.7zip", "install_powertoys": "Microsoft.PowerToys", "install_rufus": "Rufus.Rufus", "install_vlc": "VideoLAN.VLC", "install_brave": "Brave.Brave", "install_firefox": "Mozilla.Firefox", "install_libreoffice": "TheDocumentFoundation.LibreOffice", "install_obsidian": "Obsidian.Obsidian", "install_vscode": "Microsoft.VisualStudioCode", "install_git": "Git.Git" }[installId]);

async function getInstallTasks() {
    // Set all install options to 'not installed' by default for a clean slate.
    return baseInstallTasks().map(task => ({
        ...task,
        installed: false
    }));
}

async function installPackage(id) {
    const packageId = getPackageId(id);
    if (!packageId) throw new Error(`Unknown package ID: ${id}`);
    await runCommand("winget", ["install", "-e", "--id", packageId, "--accept-source-agreements", "--accept-package-agreements", "--force"]);
    return `Execution complete for: ${packageId}`;
}


// --- Final Export ---
module.exports = {
    getSystemInfo,
    getTweaks,
    applyTweak,
    getDebloatTasks,
    applyDebloat,
    getCleanupTasks,
    runCleanupTask,
    getBackupTasks,
    runBackupTask,
    getInstallTasks,
    installPackage
};