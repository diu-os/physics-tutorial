use axum::{http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Get user progress (mock implementation for MVP)
pub async fn get_progress() -> Json<UserProgress> {
    // TODO: Get from database based on authenticated user
    Json(UserProgress {
        user_id: "demo-user".to_string(),
        completed_simulations: vec![],
        current_simulation: None,
        total_time_minutes: 0,
        achievements: vec![],
        last_activity: Utc::now(),
    })
}

/// Save user progress
pub async fn save_progress(
    Json(request): Json<SaveProgressRequest>,
) -> Result<Json<UserProgress>, StatusCode> {
    // TODO: Save to database
    tracing::info!(
        "Saving progress: simulation={}, completed={}",
        request.simulation_id,
        request.completed
    );
    
    // Check achievements BEFORE moving request fields
    let achievements = check_achievements(&request);
    
    // Clone parameters before moving
    let parameters = request.parameters.clone();
    
    let progress = UserProgress {
        user_id: "demo-user".to_string(),
        completed_simulations: if request.completed {
            vec![CompletedSimulation {
                simulation_id: request.simulation_id.clone(),
                completed_at: Utc::now(),
                score: request.score,
                time_spent_minutes: request.time_spent_minutes,
            }]
        } else {
            vec![]
        },
        current_simulation: if !request.completed {
            Some(CurrentSimulation {
                simulation_id: request.simulation_id,
                started_at: Utc::now(),
                last_parameters: parameters,
            })
        } else {
            None
        },
        total_time_minutes: request.time_spent_minutes,
        achievements,
        last_activity: Utc::now(),
    };
    
    Ok(Json(progress))
}

fn check_achievements(request: &SaveProgressRequest) -> Vec<Achievement> {
    let mut achievements = vec![];
    
    // First simulation completed
    if request.completed {
        achievements.push(Achievement {
            id: "first-experiment".to_string(),
            name: "First Experiment".to_string(),
            description: "Completed your first quantum physics simulation".to_string(),
            icon: "🔬".to_string(),
            earned_at: Utc::now(),
        });
    }
    
    // High score
    if let Some(score) = request.score {
        if score >= 90.0 {
            achievements.push(Achievement {
                id: "quantum-master".to_string(),
                name: "Quantum Master".to_string(),
                description: "Achieved a score of 90% or higher".to_string(),
                icon: "🏆".to_string(),
                earned_at: Utc::now(),
            });
        }
    }
    
    achievements
}

#[derive(Serialize)]
pub struct UserProgress {
    pub user_id: String,
    pub completed_simulations: Vec<CompletedSimulation>,
    pub current_simulation: Option<CurrentSimulation>,
    pub total_time_minutes: u32,
    pub achievements: Vec<Achievement>,
    pub last_activity: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct CompletedSimulation {
    pub simulation_id: String,
    pub completed_at: DateTime<Utc>,
    pub score: Option<f64>,
    pub time_spent_minutes: u32,
}

#[derive(Serialize)]
pub struct CurrentSimulation {
    pub simulation_id: String,
    pub started_at: DateTime<Utc>,
    pub last_parameters: Option<serde_json::Value>,
}

#[derive(Serialize)]
pub struct Achievement {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub earned_at: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct SaveProgressRequest {
    pub simulation_id: String,
    pub completed: bool,
    pub score: Option<f64>,
    pub time_spent_minutes: u32,
    pub parameters: Option<serde_json::Value>,
}
