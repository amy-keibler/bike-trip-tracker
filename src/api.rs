use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct ApiTrip {
    user_id: String,
    date_time: String,
    coordinates: Coordinates,
    purpose: TripPurpose,
    data: TripData,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
struct Coordinates {
    latitude: f64,
    longitude: f64,
    accuracy: f64,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
enum TripPurpose {
    Fun,
    Shopping,
    Travel,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum TripData {
    BikeTrip { parking: BikeParking },
    CarTrip { reason: CarReason },
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
enum BikeParking {
    None,
    Nearby,
    OutFront,
    Improvised,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
enum CarReason {
    Distance,
    Weather,
    Temperature,
    Energy,
    Other,
}
