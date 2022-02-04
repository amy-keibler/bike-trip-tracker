var currentPosition = undefined;
var currentDateTime = undefined;
var map = undefined;
var mapElements = [];
var tripType = undefined;

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
        element.remove();
    });
    mapElements = [];
}

function toggleBikeCar(event) {
    event.preventDefault();
    updateInformation();
    if (tripType === event.target.id) {
        return;
    }
    tripType = event.target.id;
    console.log(`New trip type: ${tripType}`);

    const tripToggleButtons = document.querySelectorAll(".trip-toggle > button");
    tripToggleButtons.forEach((toggleButton) => toggleButton.setAttribute("selected", "false"));
    event.target.setAttribute("selected", "true");


    const submitButton = document.getElementById("form_submit");
    submitButton.setAttribute("aria-disabled", "false");

    const dynamicForm = document.getElementById("dynamic_form");
    while (dynamicForm.firstChild) {
        dynamicForm.removeChild(dynamicForm.firstChild);
    }

    const formTemplate = document.getElementById(`${tripType}_form_template`);

    const formClone = formTemplate.content.cloneNode(true);
    dynamicForm.appendChild(formClone);
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
            type: tripType,
        }
    };

    // get the purpose
    const purposeSelect = document.getElementById('trip_purpose');
    trip.purpose = purposeSelect.value;

    if (tripType === "bike_trip") {
        // get the parking
        const parkingSelect = document.getElementById('bike_parking');
        trip.data.parking = parkingSelect.value;
    } else {
        // get the reason
        const reasonSelect = document.getElementById('car_reason');
        trip.data.reason = reasonSelect.value;
    }


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
}

function clearError() {
    const errorHolder = document.getElementById("error_holder");
    errorHolder.innerText = "";
    errorHolder.classList.remove("error-shown");
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
    const tripToggleButtons = document.querySelectorAll(".trip-toggle > button");
    tripToggleButtons.forEach((toggleButton) => {
        toggleButton.addEventListener("click", toggleBikeCar);

        toggleButton.addEventListener("keyup", (event) => {
            if (event.keyCode === 13) {
                toggleBikeCar(event);
            }
        });
    });
}

initialize();
