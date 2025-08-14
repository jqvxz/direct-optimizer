use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum View {
    Dashboard,
    Tweaks,
    Debloat,
    Cleanup,
    Install,
    Backup,
    Backend,
    About,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub enum TweakCategory {
    Performance,
    Privacy,
    UI,
    Network,
    Advanced,
    #[serde(rename = "System Repair")]
    SystemRepair,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Tweak {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: TweakCategory,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub applied: Option<bool>,
    #[serde(rename = "type")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tweak_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CleanupTask {
    pub id: String,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BackupTask {
    pub id: String,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub enum InstallCategory {
    Utilities,
    Browsers,
    Productivity,
    #[serde(rename = "Developer Tools")]
    DeveloperTools,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct InstallTask {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: InstallCategory,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub enum DangerLevel {
    No,
    Low,
    Medium,
    High,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub enum DebloatCategory {
    #[serde(rename = "Definitely Recommended")]
    DefinitelyRecommended,
    #[serde(rename = "Microsoft Apps")]
    MicrosoftApps,
    #[serde(rename = "Games & Entertainment")]
    GamesAndEntertainment,
    #[serde(rename = "Third-Party Apps")]
    ThirdPartyApps,
    #[serde(rename = "OEM Bloatware")]
    OemBloatware,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DebloatTask {
    pub id: String,
    pub name: String,
    pub description: String,
    pub applied: bool,
    pub danger: DangerLevel,
    pub category: DebloatCategory,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
    pub cpu_usage: f32,
    pub ram_usage: f32,
    pub ram_total: f32,
    pub disk_usage: u64,
    pub disk_total: u64,
    pub os: String,
}