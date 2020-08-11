
var citySearchList = $("#city-searches");
var cityInfoDiv = $("#city-info");
var fiveDay = $("#five-day-forecast");
var date = moment().format("l");

var searches = [];

init();

function renderSearches() {
  var search = $("#city-search").val();
  console.log(search);
  var li = document.createElement("li");
  li.textContent = search;
  li.setAttribute("class", "list");
  citySearchList.append(li);
}

function init() {
  var storedSearches = JSON.parse(localStorage.getItem("searches"));
  if (storedSearches !== null) {
    searches = storedSearches;
  } else {
    return;
  }
  var keys = Object.entries(storedSearches);
  keys.forEach(([key, value]) => {
    var li = document.createElement("li");
    li.textContent = value;
    li.setAttribute("class", "list");
    citySearchList.append(li);
  });
}

function storeSearches() {
  localStorage.setItem("searches", JSON.stringify(searches));
}

var APIKey = "1b74b37dd2ac126972bb68addf76432f";

$("#search-button").click(function() {
  event.preventDefault();

  document.querySelector("#city-info").innerHTML = "";
  document.getElementById("day7").innerHTML = "";
  document.getElementById("day15").innerHTML = "";
  document.getElementById("day23").innerHTML = "";
  document.getElementById("day31").innerHTML = "";
  document.getElementById("day39").innerHTML = "";

  var city = $("#city-search").val();

  if (city === "") {
    return;
  }
  searches.push(city);
  $("#city-search").innerHTML = "";

  storeSearches();
  renderSearches();

  cityInfoDiv.addClass("info-container");

  var header = document.createElement("h3");
  header.innerHTML = city + " (" + date + ")";
  cityInfoDiv.append(header);

  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=" +
    APIKey;
  console.log(queryURL);

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    console.log(response);

    var todayIcon = response.weather[0].icon;
    var todayIconURL =
      "https://openweathermap.org/img/wn/" + todayIcon + ".png";

    $(header).append("<img src =" + todayIconURL + ">");

    var kelvin = response.main.temp;
    var f = Math.floor((kelvin - 273.15) * 1.8 + 32);
    $(cityInfoDiv).append("Temperature: " + f + "&deg; F <br />");

    var humidity = "Humidity: " + response.main.humidity + "%";
    var windSpeed = "Wind Speed: " + response.wind.speed + " MPH";
    $(cityInfoDiv).append(humidity + "<br />" + windSpeed + "<br/>");

    var latitude = response.coord.lat;
    var longitude = response.coord.lon;
    var latLong = "&lat=" + latitude + "&lon=" + longitude;
    console.log(latLong);

    var queryURL =
      "https://api.openweathermap.org/data/2.5/uvi/forecast?appid=" +
      APIKey +
      latLong;
    console.log(queryURL);

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {
      console.log(queryURL);
      console.log(response);
      var uvIndex = response[0].value;
      var uvDiv = $("<div>");
      $(cityInfoDiv).append("UV Index: ");

      if (uvIndex < 3) {
        $("<span/>", { class: "uvGreen", html: uvIndex }).appendTo(cityInfoDiv);
      } else if (uvIndex > 3 && uvIndex < 7) {
        $("<span/>", { class: "uvYellow", html: uvIndex }).appendTo(
          cityInfoDiv
        );
      } else {
        $("<span/>", { class: "uvRed", html: uvIndex }).appendTo(cityInfoDiv);
      }
    });

    var queryURL =
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      city +
      "&appid=" +
      APIKey;
    console.log(queryURL);

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function(response) {
      console.log(response);
      console.log("this is the length: " + response.list.length);

      for (var i = 7; i < response.list.length; i += 8) {
        $("#day" + i).addClass("five-day-weather");

        var unixTime = new Date(response.list[i].dt * 1000).toLocaleDateString(
          "en-US"
        );
   
        var date = "<strong>" + unixTime + "</strong><br/>";
        var icon = response.list[i].weather[0].icon;
        var iconURL =
          "<img src=https://openweathermap.org/img/wn/" + icon + ".png>  <br>";
        kelvin = response.list[i].main.temp;
        var temp =
          "Temp: " + Math.floor((kelvin - 273.15) * 1.8 + 32) + "&deg; F<br>";
        humidity = "Humidity: " + response.list[i].main.humidity + "%";
        $("#day" + i).append(date, iconURL, temp, humidity);
      }
    });
  });
});