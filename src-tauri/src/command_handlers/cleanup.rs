use crate::models::CleanupTask;
use crate::commands::{run_powershell, run_command};
use std::fs;
use std::env;
use tauri::AppHandle;

#[tauri::command]
pub fn get_cleanup_tasks() -> Vec<CleanupTask> {
    vec![
        CleanupTask { id: "cleanup_temp".to_string(), name: "Temporary Files".to_string(), description: "Remove temporary files from Windows and applications.".to_string() },
        CleanupTask { id: "cleanup_recycle".to_string(), name: "Empty Recycle Bin".to_string(), description: "Permanently delete all items in the Recycle Bin.".to_string() },
        CleanupTask { id: "cleanup_thumbnails".to_string(), name: "Thumbnail Cache".to_string(), description: "Clear the cache of file and image thumbnails.".to_string() },
        CleanupTask { id: "cleanup_updates".to_string(), name: "Windows Update Cache".to_string(), description: "Remove old downloaded Windows Update files.".to_string() },
        CleanupTask { id: "cleanup_disk_cleanup".to_string(), name: "Run Disk Cleanup Utility".to_string(), description: "Opens the built-in Windows Disk Cleanup tool (cleanmgr).".to_string() },
        CleanupTask { id: "cleanup_clear_arp".to_string(), name: "Clear ARP Cache".to_string(), description: "Removes dynamic entries from the Address Resolution Protocol cache.".to_string() },
    ]
}

pub fn clear_temp_files() -> Result<String, String> {
    let temp_dir = env::temp_dir();
    let mut deleted_count = 0;
    let mut error_count = 0;
    
    if let Ok(entries) = fs::read_dir(&temp_dir) {
        for entry in entries.filter_map(Result::ok) {
            let path = entry.path();
            if path.is_dir() {
                if fs::remove_dir_all(path).is_ok() {
                    deleted_count += 1;
                } else {
                    error_count += 1;
                }
            } else if path.is_file() {
                if fs::remove_file(path).is_ok() {
                    deleted_count += 1;
                } else {
                    error_count += 1;
                }
            }
        }
    }
    Ok(format!("Cleared {} files/folders. {} files were in use.", deleted_count, error_count))
}

pub async fn empty_recycle_bin(app: &AppHandle) -> Result<String, String> {
    run_powershell(app, "Clear-RecycleBin -Force -ErrorAction SilentlyContinue").await
        .map(|_| "Recycle Bin emptied.".to_string())
}

pub async fn clear_thumbnail_cache(app: &AppHandle) -> Result<String, String> {
    let script = "Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue; Get-ChildItem \"$env:localappdata\\Microsoft\\Windows\\Explorer\\thumbcache_*.db\" | Remove-Item -Force -ErrorAction SilentlyContinue; Start-Process explorer";
    run_powershell(app, script).await
        .map(|_| "Thumbnail cache cleared and Explorer restarted.".to_string())
}

pub async fn clear_windows_update_cache(app: &AppHandle) -> Result<String, String> {
    let script = "net stop wuauserv; Remove-Item \"$env:windir\\SoftwareDistribution\" -Recurse -Force -ErrorAction SilentlyContinue; net start wuauserv";
    run_powershell(app, script).await
        .map(|_| "Windows Update cache cleared and service restarted.".to_string())
}

pub async fn clear_arp_cache(app: &AppHandle) -> Result<String, String> {
    run_command(app, "arp", vec!["-d", "*"]).await
        .map(|_| "ARP cache cleared.".to_string())
}