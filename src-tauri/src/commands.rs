use std::collections::HashMap;
use crate::command_handlers::{tweaks, debloat, cleanup, backup, install};
use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;

// Helper functions made public so other modules can use them.
pub async fn run_command(app: &AppHandle, program: &str, args: Vec<&str>) -> Result<String, String> {
    let output = app.shell()
        .command(program)
        .args(args)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(output.stdout)
    } else {
        Err(output.stderr)
    }
}

pub async fn run_powershell(app: &AppHandle, script: &str) -> Result<String, String> {
    run_command(app, "powershell", vec!["-ExecutionPolicy", "Bypass", "-NoProfile", "-Command", script]).await
}

pub async fn check_powershell_condition(app: &AppHandle, script: &str) -> bool {
    run_powershell(app, script).await.map(|s| !s.trim().is_empty()).unwrap_or(false)
}

// Central handler for toggle-based changes (Tweaks, Debloat)
#[tauri::command]
pub async fn apply_changes(app: AppHandle, changes: HashMap<String, bool>) -> Result<String, String> {
    let mut successful_changes = 0;
    let mut errors = Vec::new();

    for (id, value) in changes {
        let result = if id.starts_with("tweak_") || id.starts_with("adv_") || id.starts_with("perf_") || id.starts_with("privacy_") || id.starts_with("ui_") || id.starts_with("net_"){
            tweaks::apply_tweak(&app, &id, value).await
        } else if id.starts_with("debloat_") {
            debloat::apply_debloat(&app, &id, value).await
        } else {
            Err(format!("Unknown change ID prefix: {}", id))
        };
        
        if result.is_ok() {
            successful_changes += 1;
        } else {
            let error_message = result.err().unwrap_or_else(|| "Unknown error".to_string());
            errors.push(format!("Failed to apply change for {}: {}", id, error_message));
            eprintln!("Failed to apply change for {}: {}", id, error_message);
        }
    }

    if errors.is_empty() {
        Ok(format!("Successfully applied {} changes.", successful_changes))
    } else {
        Err(format!("Completed with {} errors:\n{}", errors.len(), errors.join("\n")))
    }
}

// Central handler for action-based tasks (Cleanup, Backup, Install, Repair)
#[tauri::command]
pub async fn run_task(app: AppHandle, id: String) -> Result<String, String> {
    match id.as_str() {
        // Cleanup Tasks
        "cleanup_temp" => cleanup::clear_temp_files(),
        "cleanup_recycle" => cleanup::empty_recycle_bin(&app).await,
        "cleanup_thumbnails" => cleanup::clear_thumbnail_cache(&app).await,
        "cleanup_updates" => cleanup::clear_windows_update_cache(&app).await,
        "cleanup_disk_cleanup" => run_command(&app, "cleanmgr", vec![]).await.map(|_| "Disk Cleanup utility opened.".to_string()),
        "cleanup_clear_arp" => cleanup::clear_arp_cache(&app).await,
        
        // Backup Tasks
        "backup_create_restore" => backup::create_restore_point(&app).await,
        "backup_registry" => backup::backup_registry(&app).await,
        
        // Install Tasks
        id if id.starts_with("install_") => install::install_package(&app, id).await,
        
        // System Repair Actions
        "repair_flush_dns" => run_command(&app, "ipconfig", vec!["/flushdns"]).await.map(|_| "DNS cache flushed.".to_string()),
        "repair_reset_winsock" => run_command(&app, "netsh", vec!["winsock", "reset"]).await.map(|_| "Winsock catalog reset.".to_string()),
        "repair_reset_ip" => run_command(&app, "netsh", vec!["int", "ip", "reset"]).await.map(|_| "TCP/IP stack reset.".to_string()),
        "repair_renew_ip" => run_command(&app, "ipconfig", vec!["/release", "&&", "ipconfig", "/renew"]).await.map(|_| "IP address released and renewed.".to_string()),
        "repair_reset_firewall" => run_powershell(&app, "netsh advfirewall reset").await.map(|_| "Windows Firewall settings restored to default.".to_string()),
        "repair_restart_explorer" => run_powershell(&app, "Stop-Process -Name explorer -Force; Start-Process explorer").await.map(|_| "Windows Explorer restarted.".to_string()),
        "repair_restart_audio" => run_powershell(&app, "net stop Audiosrv; net start Audiosrv").await.map(|_| "Windows Audio service restarted.".to_string()),
        "repair_sfc_scan" => run_command(&app, "sfc", vec!["/scannow"]).await.map(|_| "System File Check started. This may take a while.".to_string()),

        _ => Err(format!("Unknown task ID: {}", id)),
    }
}