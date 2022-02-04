var currentPosition = undefined;
var currentDateTime = undefined;
var map = undefined;
var mapElements = [];
var tripType = 'bike_trip';

export function updateInformation() {
    // get the datetime
    currentDateTime = new Date();

    const dateHolder = document.getElementById("date_holder");
    dateHolder.innerText = currentDateTime.toLocaleString();

    // get the coordinates
    if (!navigator.geolocation) {
        displayError("Browser does not support getting GPS location");
        return;
    }

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    const location = navigator.geolocation.getCurrentPosition(
        (position) => {
            currentPosition = position.coords;
            clearMap();
            const lat = currentPosition.latitude;
            const long = currentPosition.longitude;
            map.setView([lat, long], 13);
            mapElements.push(L.marker([lat, long]).addTo(map));
            mapElements.push(L.circle([lat, long], {
                color: 'green',
                radius: currentPosition.accuracy
            }).addTo(map));
        },
        (error) => {
            console.log(`Failed to get position: ${error.message}`);
            displayError("Could not get GPS location");
            currentPosition = undefined;
            clearMap();
        },
        options
    );
}

function clearMap() {
    mapElements.forEach((element) => {
        console.log(element);
        element.remove();
    });
    mapElements = [];
}

function toggleBikeCar(newTripType) {
    updateInformation();
    tripType = newTripType;

    // TODO: hide / display form details & manage aria live region
}

function submitForm(event) {
    event.preventDefault();
    clearError();

    const submitButton = document.getElementById("form_submit");
    if (submitButton.getAttribute("aria-disabled") === "true") {
        return;
    }

    submitButton.setAttribute("aria-disabled", "true");


    const trip = {
        user_id: 'test',
        data: {
            type: 'bike_trip',
        }
    };

    // get the purpose
    const purposeSelect = document.getElementById('trip_purpose');
    trip.purpose = purposeSelect.value;

    // get the parking
    const parkingSelect = document.getElementById('bike_parking');
    trip.data.parking = parkingSelect.value;

    // get the reason
    const reasonSelect = document.getElementById('car_reason');
    trip.data.reason = reasonSelect.value;


    // get the datetime
    trip.date_time = currentDateTime.toJSON();

    trip.coordinates = {
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        accuracy: currentPosition.accuracy
    };

    const options = {
        method: 'POST',
        body: JSON.stringify(trip)
    };
    fetch('/api/trip', options)
        .then((response) => {
            if (!response.ok) {
                displayError("Failed to save trip");
            }
            submitButton.setAttribute("aria-disabled", "false");
        });
}

function displayError(errorMessage) {
    const errorHolder = document.getElementById("error_holder");
    errorHolder.innerText = errorMessage;
    errorHolder.classList.add("error-shown");
    errorHolder.setAttribute("aria-live", "assertive");
}

function clearError() {
    const errorHolder = document.getElementById("error_holder");
    errorHolder.innerText = "";
    errorHolder.classList.remove("error-shown");
    errorHolder.removeAttribute("aria-live");
}

function initialize() {
    map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    updateInformation();

    const submitButton = document.getElementById("form_submit");
    submitButton.addEventListener("click", submitForm);

    // handle submitting via the enter key when focused
    submitButton.addEventListener("keyup", (event) => {
        if (event.keyCode === 13) {
            submitForm(event);
        }
    });

    // set up bike / car toggle handlers
    const radios = document.querySelectorAll("input[name=type]");
    radios.forEach((radioInput) => {
        radioInput.onchange = (event) => {
            toggleBikeCar(event.target.value);
        };
    });
}

initialize();
