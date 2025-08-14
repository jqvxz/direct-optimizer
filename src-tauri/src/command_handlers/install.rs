use crate::models::{InstallTask, InstallCategory};
use crate::commands::run_command;
use tauri::AppHandle;

#[tauri::command]
pub fn get_install_tasks() -> Vec<InstallTask> {
    vec![
        // Utilities
        InstallTask { id: "install_7zip".to_string(), name: "7-Zip".to_string(), description: "A free and open-source file archiver with a high compression ratio.".to_string(), category: InstallCategory::Utilities },
        InstallTask { id: "install_powertoys".to_string(), name: "Microsoft PowerToys".to_string(), description: "A set of utilities for power users to tune and streamline their Windows experience.".to_string(), category: InstallCategory::Utilities },
        InstallTask { id: "install_rufus".to_string(), name: "Rufus".to_string(), description: "A utility that helps format and create bootable USB flash drives.".to_string(), category: InstallCategory::Utilities },
        InstallTask { id: "install_vlc".to_string(), name: "VLC Media Player".to_string(), description: "A versatile multimedia player that plays most multimedia files.".to_string(), category: InstallCategory::Utilities },
        
        // Browsers
        InstallTask { id: "install_brave".to_string(), name: "Brave Browser".to_string(), description: "A privacy-focused browser that blocks ads and trackers by default.".to_string(), category: InstallCategory::Browsers },
        InstallTask { id: "install_firefox".to_string(), name: "Firefox Browser".to_string(), description: "A popular open-source web browser developed by the Mozilla Foundation.".to_string(), category: InstallCategory::Browsers },
        
        // Productivity
        InstallTask { id: "install_libreoffice".to_string(), name: "LibreOffice".to_string(), description: "A powerful and free office suite, a successor to OpenOffice.org.".to_string(), category: InstallCategory::Productivity },
        InstallTask { id: "install_obsidian".to_string(), name: "Obsidian".to_string(), description: "A powerful knowledge base on top of a local folder of plain text Markdown files.".to_string(), category: InstallCategory::Productivity },
        
        // Developer Tools
        InstallTask { id: "install_vscode".to_string(), name: "Visual Studio Code".to_string(), description: "A lightweight but powerful source code editor.".to_string(), category: InstallCategory::DeveloperTools },
        InstallTask { id: "install_git".to_string(), name: "Git for Windows".to_string(), description: "The official build of Git for Windows.".to_string(), category: InstallCategory::DeveloperTools },
    ]
}

pub async fn install_package(app: &AppHandle, id: &str) -> Result<String, String> {
    let package_id = match id {
        // Utilities
        "install_7zip" => "7zip.7zip",
        "install_powertoys" => "Microsoft.PowerToys",
        "install_rufus" => "Rufus.Rufus",
        "install_vlc" => "VideoLAN.VLC",
        // Browsers
        "install_brave" => "Brave.Brave",
        "install_firefox" => "Mozilla.Firefox",
        // Productivity
        "install_libreoffice" => "TheDocumentFoundation.LibreOffice",
        "install_obsidian" => "Obsidian.Obsidian",
        // Developer Tools
        "install_vscode" => "Microsoft.VisualStudioCode",
        "install_git" => "Git.Git",
        _ => return Err(format!("Unknown package ID: {}", id)),
    };
    
    // Using --force to bypass potential "already installed" errors for simplicity
    run_command(app, "winget", vec!["install", "-e", "--id", package_id, "--accept-source-agreements", "--accept-package-agreements", "--force"]).await
        .map(|_| format!("Execution complete for: {}", package_id))
}