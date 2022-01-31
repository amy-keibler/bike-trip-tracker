#[macro_use]
extern crate rocket;

mod api;

use api::ApiTrip;
use rocket::fs::{relative, FileServer};
use rocket::serde::json::Json;
use rocket_dyn_templates::Template;
use serde::Serialize;

#[derive(Serialize)]
struct IndexPage {
    user_name: Option<String>,
}

#[get("/")]
fn index() -> Template {
    let context = IndexPage {
        user_name: Some("Amy".to_string()),
    };
    Template::render("index", &context)
}

#[post("/api/trip", data = "<trip>")]
async fn post_trip(trip: Json<ApiTrip>) {
    println!("Recieved trip: {:?}", trip);
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, post_trip])
        .mount("/static", FileServer::from(relative!("static")))
        .attach(Template::fairing())
}
