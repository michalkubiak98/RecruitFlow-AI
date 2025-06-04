use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Candidate {
    id: Option<i32>,
    name: String,
    location: Option<String>,
    salary: Option<String>,
    roles: Option<String>,
    drives: bool,
    status: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct CreateCandidateRequest {
    name: String,
    location: Option<String>,
    salary: Option<String>,
    roles: Option<String>,
    drives: Option<bool>,
    status: Option<String>,
}

// Tauri command to create a candidate
#[tauri::command]
async fn create_candidate(data: CreateCandidateRequest) -> Result<String, String> {
    println!("🚀 Creating candidate: {:?}", data);
    
    // For now, just return success - we'll implement real database later
    Ok(format!("Created candidate: {}", data.name))
}

// Tauri command to get all candidates
#[tauri::command]
async fn get_candidates() -> Result<Vec<Candidate>, String> {
    println!("📋 Getting all candidates");
    
    // For now, return empty list - we'll implement real database later
    Ok(vec![])
}

// Tauri command to find candidate by name
#[tauri::command]
async fn find_candidate_by_name(name: String) -> Result<Option<Candidate>, String> {
    println!("🔍 Finding candidate: {}", name);
    
    // For now, return None - we'll implement real database later
    Ok(None)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            create_candidate,
            get_candidates,
            find_candidate_by_name
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
