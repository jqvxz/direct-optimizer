use crate::models::BackupTask;
use crate::commands::{run_powershell, run_command};
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
pub fn get_backup_tasks() -> Vec<BackupTask> {
    vec![
        BackupTask { id: "backup_registry".to_string(), name: "Backup Registry".to_string(), description: "Creates a backup of the current Windows Registry hives.".to_string() },
        BackupTask { id: "backup_create_restore".to_string(), name: "Create Restore Point".to_string(), description: "Creates a system restore point to revert to if needed.".to_string() },
    ]
}

pub async fn create_restore_point(app: &AppHandle) -> Result<String, String> {
    run_powershell(app, "Checkpoint-Computer -Description \"DIRECT-optimizer Backup\" -RestorePointType 'MODIFY_SETTINGS'").await
        .map(|_| "System Restore Point created successfully.".to_string())
        .map_err(|e| format!("Failed to create restore point. Ensure you are running as Administrator. Error: {}", e))
}

pub async fn backup_registry(app: &AppHandle) -> Result<String, String> {
    let file_path = app.dialog()
        .file()
        .add_filter("Registry Backup", &["reg"])
        .save_file()
        .await;

    if let Some(path) = file_path {
        let path_str = path.to_string_lossy().to_string();
        let hives = vec!["HKCU", "HKLM", "HKCR", "HKU", "HKCC"];
        let mut errors = Vec::new();

        for hive in hives {
            let file_name = format!("{}_{}.reg", path_str.trim_end_matches(".reg"), hive);
            let result = run_command(app, "reg", vec!["export", hive, &file_name, "/y"]).await;
            if result.is_err() {
                errors.push(format!("Failed to back up {}: {:?}", hive, result.err()));
            }
        }

        if errors.is_empty() {
            Ok(format!("Registry backup completed successfully."))
        } else {
            Err(format!("Registry backup completed with errors: {}", errors.join(", ")))
        }

    } else {
        Ok("Registry backup cancelled by user.".to_string())
    }
}