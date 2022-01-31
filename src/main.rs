#[macro_use]
extern crate rocket;

mod api;

use api::ApiTrip;
use rocket::serde::json::Json;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[post("/api/trip", data = "<trip>")]
async fn post_trip(trip: Json<ApiTrip>) {
    println!("Recieved trip: {:?}", trip);
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, post_trip])
}
