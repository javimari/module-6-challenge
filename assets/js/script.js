// Retrieve the search history from local storage or initialize an empty array if none exists
var cities = JSON.parse(localStorage.getItem('search-history')) || [];

// Function to add a city and fetch its weather data
var addCity = function (city) {
    console.log("add city");
    var APIKey = "cd881b34484180e1564e3a1f6ed56fc0";
    console.log(city);
    var cityUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&limit=5&appid=" + APIKey;
    
    fetch(cityUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log("fetched city", data);
            populateCityToday(data); // Display current weather
            populateForecast(data);  // Display 5-day forecast
        });
    saveCity(city); // Save the city to local storage and update the search history
};

// Function to save a city to local storage
var saveCity = function (cityName) {
    var cityObject = {
        city: cityName
    };
    cities.unshift(cityObject); // Add the new city to the beginning of the array
    cities = cities.slice(0, 10); // Keep only the last 10 cities
    localStorage.setItem("cities", JSON.stringify(cities)); // Save the updated cities array to local storage
    updateCityList(); // Update the displayed list of cities
};

// Function to load cities from local storage
var loadCities = function () {
    var savedCities = localStorage.getItem("cities");

    if (savedCities) {
        cities = JSON.parse(savedCities);
        updateCityList(); // Update the displayed list of cities
    }
};

// Function to clear the cities from local storage and the displayed list
var clearCities = function () {
    cities = [];
    localStorage.removeItem("cities");
    updateCityList(); // Update the displayed list of cities
};

// Function to display the current weather for the city
var populateCityToday = function (APIResponse) {
    // Clear previous weather information
    document.getElementById('weather-today').innerHTML = '';
    document.getElementById('five-day').innerHTML = '';

    // Extract the necessary data from the API response
    var resultsToday = {
        cityName: APIResponse.city.name,
        currentDate: APIResponse.list[0].dt_txt.split(" ")[0],
        weatherIcon: APIResponse.list[0].weather[0].icon,
        cityTemp: (APIResponse.list[0].main.temp - 273.15) * 1.8 + 32,
        cityWind: APIResponse.list[0].wind.speed,
        cityHumidity: APIResponse.list[0].main.humidity,
    };

    // Create and append the elements for displaying the weather information
    var cityNameEL = document.createElement("h2");
    var dateArray = resultsToday.currentDate.split("-");
    var firstItem = dateArray.shift();
    dateArray.push(firstItem);
    console.log(dateArray);
    cityNameEL.innerHTML = resultsToday.cityName + " (" + dateArray.join("/") + ") ";
    document.getElementById("weather-today").appendChild(cityNameEL);

    var weatherIconEl = document.createElement("img");
    weatherIconEl.src = "https://openweathermap.org/img/w/" + resultsToday.weatherIcon + ".png";
    cityNameEL.appendChild(weatherIconEl);

    var cityTempEL = document.createElement("p");
    cityTempEL.innerHTML = "Temp: " + resultsToday.cityTemp.toFixed(2) + "ºF";
    document.getElementById("weather-today").appendChild(cityTempEL);

    var cityWindEL = document.createElement("p");
    cityWindEL.innerHTML = "Wind: " + resultsToday.cityWind + " MPH";
    document.getElementById("weather-today").appendChild(cityWindEL);

    var cityHumidityEL = document.createElement("p");
    cityHumidityEL.innerHTML = "Humidity: " + resultsToday.cityHumidity + "%";
    document.getElementById("weather-today").appendChild(cityHumidityEL);
}

// Function to display the 5-day weather forecast for the city
var populateForecast = function (APIResponse) {
    var forecastContainer = document.getElementById("five-day");
    var cityForecastTitle = document.createElement("h3");
    cityForecastTitle.textContent = "5-Day Forecast: ";
    forecastContainer.appendChild(cityForecastTitle);
    
    // Loop through the forecast data and create elements for each day
    for (var i = 2; i < APIResponse.list.length; i += 8) {
        var forecastDay = APIResponse.list[i];

        var forecastItem = document.createElement("div");
        forecastItem.classList.add("forecast-item");

        var forecastDate = document.createElement("h4");
        var dateArray = forecastDay.dt_txt.split(" ")[0].split("-");
        var firstItem = dateArray.shift();
        dateArray.push(firstItem);
        console.log(dateArray);
        forecastDate.textContent = " (" + dateArray.join("/") + ") ";
        forecastItem.appendChild(forecastDate);

        var forecastIcon = document.createElement("img");
        forecastIcon.src = "https://openweathermap.org/img/w/" + forecastDay.weather[0].icon + ".png";
        forecastItem.appendChild(forecastIcon);

        var forecastTemp = document.createElement("p");
        forecastTemp.textContent = "Temp: " + ((forecastDay.main.temp - 273.15) * 1.8 + 32).toFixed(2) + "ºF";
        forecastItem.appendChild(forecastTemp);

        var forecastWind = document.createElement("p");
        forecastWind.textContent = "Wind: " + forecastDay.wind.speed + "MPH";
        forecastItem.appendChild(forecastWind);

        var forecastHumidity = document.createElement("p");
        forecastHumidity.textContent = "Humidity: " + forecastDay.main.humidity + "%";
        forecastItem.appendChild(forecastHumidity);

        forecastContainer.appendChild(forecastItem);
    };
}

// Function to update the displayed list of cities
var updateCityList = function () {
    console.log("update city list", cities);
    var $cityList = $("#search-history");
    var citiesHtml = "";
    for (var i = 0; i < cities.length; i++) {
        citiesHtml += "<article class='cities' data-index='" + i + "'>";
        citiesHtml += "<button class='city'>" + cities[i].city + '</button>';
        citiesHtml += "</article>";
    };
    $cityList.html(citiesHtml);
    $('.city').click(function (){
        let city = this.innerText;
        addCity(city);
    });
};

// Function to initialize event listeners
var initListeners = function () {
    // Event listener for the search form submission
    $("#new-search").submit(function (event) {
        event.preventDefault();
    });

    // Event listener for the search button click
    $("#search-button").click(function(){
        let city = $("#new-city").val().trim() || "Raleigh";
        addCity(city);
        // Clear the search input field
        $("#new-city").val('');
    });

    // Event listener for keyup event on the city input field
    $("#new-city").keyup(function(event){
        let city = $(this).val().trim() || "Raleigh";
        if (event.key === 'Enter') {
            addCity(city);
            // Clear the search input field
            $(this).val('');
        }
    });
}

// Initialize the application when the document is ready
$(function () {
    initListeners(); // Set up event listeners
    loadCities(); // Load cities from local storage and update the list
});
