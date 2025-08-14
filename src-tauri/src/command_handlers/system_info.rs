use sysinfo::{System, Cpu, Disk};
use crate::models;

#[tauri::command(rename_all = "snake_case")]
pub fn get_system_info() -> Result<models::SystemInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let os_info = System::long_os_version().unwrap_or_else(|| "Unknown OS".to_string());
    
    // CPU
    sys.refresh_cpu();
    let cpu_usage = sys.global_cpu_info().cpu_usage();

    // Memory
    let ram_total_kb = sys.total_memory();
    let ram_used_kb = sys.used_memory();
    let ram_total_gb = ram_total_kb as f32 / 1_048_576.0;
    let ram_usage_gb = ram_used_kb as f32 / 1_048_576.0;

    // Disk (get the primary disk, usually C:)
    let mut disk_total_bytes = 0;
    let mut disk_available_bytes = 0;
    
    if let Some(primary_disk) = sys.disks().iter().find(|d| d.mount_point().to_str() == Some("C:\\")) {
        disk_total_bytes = primary_disk.total_space();
        disk_available_bytes = primary_disk.available_space();
    }

    let disk_used_bytes = disk_total_bytes - disk_available_bytes;

    Ok(models::SystemInfo {
        os: os_info,
        cpu_usage,
        ram_total: ram_total_gb,
        ram_usage: ram_usage_gb,
        disk_total: disk_total_bytes,
        disk_usage: disk_used_bytes,
    })
}