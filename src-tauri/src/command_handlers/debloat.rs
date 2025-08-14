use crate::models::{DebloatTask, DangerLevel, DebloatCategory};
use crate::commands::{run_powershell, check_powershell_condition};
use tauri::AppHandle;

fn get_appx_package_list() -> Vec<DebloatTask> {
    vec![
        // Definitely Recommended
        DebloatTask { id: "debloat_mcafee".to_string(), name: "McAfee Antivirus".to_string(), description: "Removes McAfee trial software. Recommended, as Windows Defender is generally sufficient.".to_string(), applied: false, danger: DangerLevel::No, category: DebloatCategory::DefinitelyRecommended },
        DebloatTask { id: "debloat_norton".to_string(), name: "Norton Antivirus".to_string(), description: "Removes Norton trial software. Recommended, as Windows Defender is generally sufficient.".to_string(), applied: false, danger: DangerLevel::No, category: DebloatCategory::DefinitelyRecommended },

        // Microsoft Apps
        DebloatTask { id: "debloat_cortana".to_string(), name: "Cortana".to_string(), description: "Removes the Cortana personal assistant.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_onedrive".to_string(), name: "OneDrive".to_string(), description: "Removes the OneDrive cloud storage integration.".to_string(), applied: false, danger: DangerLevel::Medium, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_onenote".to_string(), name: "OneNote".to_string(), description: "Removes the OneNote for Windows 10 app.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_skype".to_string(), name: "Skype".to_string(), description: "Removes the pre-installed Skype app.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_3dviewer".to_string(), name: "3D Viewer".to_string(), description: "Removes the 3D model viewer application.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_paint3d".to_string(), name: "Paint 3D".to_string(), description: "Removes the modern Paint 3D application.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_mixedreality".to_string(), name: "Mixed Reality Portal".to_string(), description: "Removes the portal for Windows Mixed Reality headsets.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_people".to_string(), name: "People App".to_string(), description: "Removes the People app for contact management.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_news".to_string(), name: "News".to_string(), description: "Removes the News widget and application.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_weather".to_string(), name: "Weather".to_string(), description: "Removes the Weather widget and application.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_movies_tv".to_string(), name: "Movies & TV".to_string(), description: "Removes the default video player app.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_groove".to_string(), name: "Groove Music".to_string(), description: "Removes the default music player app.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::MicrosoftApps },
        DebloatTask { id: "debloat_mail_calendar".to_string(), name: "Mail & Calendar".to_string(), description: "Removes the default Mail and Calendar apps.".to_string(), applied: false, danger: DangerLevel::Medium, category: DebloatCategory::MicrosoftApps },
        
        // Games & Entertainment
        DebloatTask { id: "debloat_gamebar".to_string(), name: "Xbox Game Bar".to_string(), description: "Disables the Xbox Game Bar and its related background processes.".to_string(), applied: false, danger: DangerLevel::Medium, category: DebloatCategory::GamesAndEntertainment },
        DebloatTask { id: "debloat_xbox_companion".to_string(), name: "Xbox Console Companion".to_string(), description: "Removes the Xbox app for console integration.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::GamesAndEntertainment },
        DebloatTask { id: "debloat_solitaire".to_string(), name: "Microsoft Solitaire Collection".to_string(), description: "Removes the Solitaire card game collection.".to_string(), applied: false, danger: DangerLevel::Low, category: DebloatCategory::GamesAndEntertainment },
    ]
}

fn get_package_name_for_id(id: &str) -> &str {
    match id {
        "debloat_mcafee" => "*McAfee*",
        "debloat_norton" => "*Norton*",
        "debloat_cortana" => "*Microsoft.549981C3F5F10*",
        "debloat_onedrive" => "*Microsoft.OneDriveSync*",
        "debloat_onenote" => "*Microsoft.Office.OneNote*",
        "debloat_skype" => "*Microsoft.SkypeApp*",
        "debloat_3dviewer" => "*Microsoft.3DViewer*",
        "debloat_paint3d" => "*Microsoft.Paint3D*",
        "debloat_mixedreality" => "*Microsoft.MixedReality.Portal*",
        "debloat_people" => "*Microsoft.People*",
        "debloat_news" => "*Microsoft.BingNews*",
        "debloat_weather" => "*Microsoft.BingWeather*",
        "debloat_movies_tv" => "*Microsoft.ZuneVideo*",
        "debloat_groove" => "*Microsoft.ZuneMusic*",
        "debloat_mail_calendar" => "*microsoft.windowscommunicationsapps*",
        "debloat_gamebar" => "*Microsoft.XboxGamingOverlay*",
        "debloat_xbox_companion" => "*Microsoft.XboxApp*",
        "debloat_solitaire" => "*Microsoft.MicrosoftSolitaireCollection*",
        _ => "",
    }
}

#[tauri::command]
pub async fn get_debloat_tasks(app: AppHandle) -> Vec<DebloatTask> {
    let mut tasks = get_appx_package_list();
    for task in &mut tasks {
        let package_name = get_package_name_for_id(&task.id);
        if !package_name.is_empty() {
            let check_script = format!("Get-AppxPackage -Name '{}' -AllUsers", package_name);
            task.applied = !check_powershell_condition(&app, &check_script).await; // `applied` is true if it's REMOVED (not found)
        }
    }
    tasks
}

pub async fn apply_debloat(app: &AppHandle, id: &str, value: bool) -> Result<(), String> {
    let package_name = get_package_name_for_id(id);
    if package_name.is_empty() {
        return Err(format!("Unknown debloat ID: {}", id));
    }

    let script = if value { // true means remove
        format!("Get-AppxPackage -Name '{}' -AllUsers | Remove-AppxPackage -AllUsers", package_name)
    } else { // false means add back
        // This command re-registers the app for the current user if the manifest exists.
        // A full reinstall from the store is more complex.
        format!("Get-AppxPackage -Name '{}' -AllUsers | Foreach {{Add-AppxPackage -DisableDevelopmentMode -Register \"$($_.InstallLocation)\\AppXManifest.xml\"}}", package_name)
    };

    run_powershell(app, &script).await
        .map(|_| ())
        .map_err(|e| format!("PowerShell error for {}: {}", id, e))
}