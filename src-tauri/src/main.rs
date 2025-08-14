// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod commands;
mod command_handlers;

use command_handlers::{system_info, tweaks, debloat, cleanup, backup, install};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Data getters
            system_info::get_system_info,
            tweaks::get_tweaks,
            debloat::get_debloat_tasks,
            cleanup::get_cleanup_tasks,
            backup::get_backup_tasks,
            install::get_install_tasks,

            // Action runners
            commands::run_task,
            commands::apply_changes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}