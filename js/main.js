var apiKey = "758a674f2aca429e810235744252206";
var apiUrl = "https://api.weatherapi.com/v1/";
const searchInput = document.getElementById("search-input");
const cardsWeather = document.getElementById("cards-weather");
let blackBox = ``;

const utils = {
  // Get current date in YYYY-MM-DD format
  getCurrentDate: function () {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
  // Get day name from date
  getDayName: function (date) {
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    return dayName;
  },
  // Get formatted date in "dayMonth" format
  getFormattedDate: function (date) {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString("en-US", { month: "long" });
    return `${day}${month}`;
  },
  // Get current location using Geolocation API
  getCurrentLocation: function () {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            resolve(`${lat},${lon}`);
          },
          (error) => {
            console.error("Error in getting location:", error);
            reject("Error");
          }
        );
      } else {
        reject("Geolocation is not supported by this browser.");
      }
    });
  },
};

async function getWeatherAndForecast(query) {
  const currentLocation = await utils.getCurrentLocation();
  displayLoading();
  try {
    const weather = await fetch(`${apiUrl}current.json?key=${apiKey}&q=${query || currentLocation}&dt=${utils.getCurrentDate()}`);
    const forecast = await fetch(`${apiUrl}forecast.json?key=${apiKey}&q=${query || currentLocation}&days=3`);
    const weatherData = await weather.json();
    const forecastData = await forecast.json();

    if (!weather.ok || !forecast.ok) throw new Error(`Error fetching weather or forecast data: ${weather.status}, ${forecast.status}`);
    if (!weatherData.error && !forecastData.error) displayWeatherAndForecast(weatherData, forecastData);
    else displayNoData();

  } catch (error) {
    console.error("An error occurred while getting weather and forecast:", error);
    displayNoData();
  } finally {
    if (cardsWeather.innerHTML.includes('<div class="spinner"></div>')) {
      cardsWeather.innerHTML = "";
    }
  }
}

async function getSearch() {
  try {
    const response = await fetch(`${apiUrl}search.json?key=${apiKey}&q=${searchInput.value}`);
    const data = await response.json();
    if (!response.ok) throw new Error(`Error fetching search data: ${response.status}`);
    if (data.length === 0) {
      displayNoData();
    } else {
      getWeatherAndForecast(`id:${data[0].id}`);
    }
  } catch (error) {
    console.error("An error occurred while getting search input:", error);
  }
}
searchInput.addEventListener("change", getSearch);

function displayWeatherAndForecast(dataWeather, dataForecast) {
  const { name, localtime } = dataWeather.location;
  const { temp_c, condition, wind_kph, wind_dir, humidity } =
    dataWeather.current;
  const { forecastday } = dataForecast.forecast;

  blackBox = `<div class="col-lg-4 px-0">
                <div class="card border-0 rounded-lg-start">
                  <div
                    class="card-header d-flex justify-content-between align-items-center"
                  >
                    <p class="day m-0 small">${utils.getDayName(localtime)}</p>
                    <p class="date m-0 small">${utils.getFormattedDate(
                      localtime
                    )}</p>
                  </div>
                  <div class="card-body p-4">
                    <div class="location h5 fw-normal">${name}</div>
                    <div class="temperature text-light fw-bold d-flex d-lg-block d-xxl-flex align-items-center gap-4">
                      <p class="m-0">${temp_c}<span class="degree">°C</span></p>
                      <img src="${condition.icon}" alt="${condition.text}" />
                    </div>
                    <p class="description m-0 text-main small">${
                      condition.text
                    }</p>
                    <div class="weather-details d-flex gap-3 mt-3">
                      <div class="sunny">
                        <img src="./images/umberella.png" alt="sunny" />
                        <span class="value ms-1 small">${humidity}%</span>
                      </div>
                      <div class="wind">
                        <img src="./images/wind.png" alt="wind" />
                        <span class="value ms-1 small">${wind_kph}km/h</span>
                      </div>
                      <div class="compass">
                        <img src="./images/compass.png" alt="compass" />
                        <span class="value ms-1 small">${wind_dir}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`;

  for (let i = 1; i < forecastday.length; i++) {
    const { date, day } = forecastday[i];
    const { maxtemp_c, mintemp_c, condition } = day;
    blackBox += `<div class="col-lg-4 px-0">
                <div class="card border-0 h-100">
                  <div class="card-header text-center">
                    <p class="day m-0 small">${utils.getDayName(date)}</p>
                  </div>
                  <div class="card-body d-flex flex-column align-items-center py-5">
                    <img src="${condition.icon}" alt="${condition.text}" />
                    <p class="temperature fs-4 text-light mt-4 mb-0 fw-bold">
                      ${maxtemp_c}<span class="degree">°C</span>
                    </p>
                    <p class="">${mintemp_c}<span class="degree">°</span></p>
                    <p class="description m-0 text-main small">${
                      condition.text
                    }</p>
                  </div>
                </div>
              </div>`;
    cardsWeather.innerHTML = blackBox;
  }
}

function displayNoData() {
  cardsWeather.innerHTML = `<div class="col-12 text-center no-data text-light m-auto p-4 rounded">
                              <p class="fs-5 m-0">No data available</p>
                            </div>`;
}

function displayLoading() {
  cardsWeather.innerHTML = `<div class="d-flex justify-content-center my-5"><div class="spinner"></div></div>
  `;
}

getWeatherAndForecast();
