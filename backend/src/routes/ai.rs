use axum::{http::StatusCode, Json};
use serde::{Deserialize, Serialize};

/// Handle AI questions about physics
pub async fn ask_question(
    Json(request): Json<AskQuestionRequest>,
) -> Result<Json<AskQuestionResponse>, StatusCode> {
    // For MVP: Return pre-defined answers for common questions
    // TODO: Integrate with OpenAI API or local LLM
    
    let answer = get_physics_answer(&request.question, &request.context);
    
    Ok(Json(AskQuestionResponse {
        answer,
        related_topics: get_related_topics(&request.question),
        suggested_experiments: get_suggested_experiments(&request.question),
    }))
}

fn get_physics_answer(question: &str, _context: &Option<String>) -> String {
    let q = question.to_lowercase();
    
    // Check for common physics questions
    if q.contains("interference") || q.contains("интерференц") {
        return r#"**Interference** occurs when two or more waves overlap, resulting in a new wave pattern.

In the double-slit experiment:
- When waves are in phase (crests align), they create **constructive interference** (bright bands)
- When waves are out of phase (crest meets trough), they create **destructive interference** (dark bands)

The spacing of the interference pattern depends on:
- Wavelength of light (λ)
- Distance between slits (d)
- Distance to the screen (L)

Try adjusting the wavelength slider to see how the pattern changes!"#.to_string();
    }
    
    if q.contains("wave") && q.contains("particle") || q.contains("duality") {
        return r#"**Wave-particle duality** is one of the most fundamental concepts in quantum mechanics.

It means that quantum objects (like electrons, photons) exhibit both wave-like and particle-like properties:

1. **As waves**: They can interfere, diffract, and create patterns
2. **As particles**: They hit detectors at specific points

The key insight: **observation matters**! When we try to determine which slit a particle passes through, the interference pattern disappears.

This is demonstrated beautifully in the double-slit experiment. Try turning on "Observer Mode" to see the difference!"#.to_string();
    }
    
    if q.contains("tunnel") || q.contains("barrier") {
        return r#"**Quantum tunneling** is a phenomenon where a particle can pass through a potential barrier even if its energy is less than the barrier height.

Classically, this is impossible - imagine a ball rolling toward a hill without enough energy to go over it.

In quantum mechanics, the particle's wave function extends beyond the barrier, giving a non-zero probability of finding the particle on the other side.

**Key factors affecting tunneling probability:**
- Barrier height (higher = less tunneling)
- Barrier width (wider = less tunneling)
- Particle mass (heavier = less tunneling)
- Particle energy (higher = more tunneling)

Try the Quantum Tunneling simulation to explore these relationships!"#.to_string();
    }
    
    if q.contains("orbital") || q.contains("electron") && q.contains("atom") {
        return r#"**Atomic orbitals** are regions of space where electrons are most likely to be found.

In the hydrogen atom:
- **s orbitals**: Spherical, can hold 2 electrons
- **p orbitals**: Dumbbell-shaped, can hold 6 electrons  
- **d orbitals**: More complex shapes, can hold 10 electrons

The shapes are determined by the wave function solutions to the Schrödinger equation.

Each orbital is characterized by quantum numbers:
- n (principal): energy level
- l (angular momentum): shape
- m (magnetic): orientation

Explore the Hydrogen Atom simulation to see these orbitals in 3D!"#.to_string();
    }
    
    // Default response
    format!(r#"That's a great question about physics! 

Based on your question: "{}"

I'd recommend exploring the relevant simulation to build intuition. You can:
1. Adjust parameters and observe changes
2. Read the theory section for mathematical details
3. Ask more specific questions about what you observe

What aspect would you like to explore further?"#, question)
}

fn get_related_topics(question: &str) -> Vec<String> {
    let q = question.to_lowercase();
    
    if q.contains("interference") || q.contains("slit") {
        vec![
            "Wave-particle duality".to_string(),
            "Quantum superposition".to_string(),
            "Wave function collapse".to_string(),
            "Heisenberg uncertainty principle".to_string(),
        ]
    } else if q.contains("tunnel") {
        vec![
            "Potential barriers".to_string(),
            "Schrödinger equation".to_string(),
            "Alpha decay".to_string(),
            "Scanning tunneling microscope".to_string(),
        ]
    } else if q.contains("orbital") || q.contains("atom") {
        vec![
            "Quantum numbers".to_string(),
            "Electron configuration".to_string(),
            "Spectral lines".to_string(),
            "Bohr model".to_string(),
        ]
    } else {
        vec![
            "Quantum mechanics basics".to_string(),
            "Wave function".to_string(),
            "Probability in quantum physics".to_string(),
        ]
    }
}

fn get_suggested_experiments(question: &str) -> Vec<SuggestedExperiment> {
    let q = question.to_lowercase();
    
    if q.contains("interference") || q.contains("slit") || q.contains("wave") {
        vec![
            SuggestedExperiment {
                simulation_id: "double-slit".to_string(),
                title: "Vary the wavelength".to_string(),
                description: "Change the wavelength from 400nm to 700nm and observe how the interference pattern spacing changes".to_string(),
            },
            SuggestedExperiment {
                simulation_id: "double-slit".to_string(),
                title: "Toggle observer mode".to_string(),
                description: "Turn observer mode on and off to see the dramatic difference between wave and particle behavior".to_string(),
            },
        ]
    } else {
        vec![]
    }
}

#[derive(Deserialize)]
pub struct AskQuestionRequest {
    pub question: String,
    pub context: Option<String>,  // Current simulation, parameters, etc.
}

#[derive(Serialize)]
pub struct AskQuestionResponse {
    pub answer: String,
    pub related_topics: Vec<String>,
    pub suggested_experiments: Vec<SuggestedExperiment>,
}

#[derive(Serialize)]
pub struct SuggestedExperiment {
    pub simulation_id: String,
    pub title: String,
    pub description: String,
}
