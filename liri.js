require("dotenv").config();
var fs = require("fs");
var keys = require("./keys.js");
var request = require("request");
var Spotify = require("node-spotify-api");
var spotify = new Spotify(keys.spotify);

var action = process.argv[2];
var parameter = process.argv[3];

function switchCase() {
    switch (action) {
        case 'concert-this':
            bandsInTown(parameter);
            break;

        case 'spotify-this-song':
            spotSong(parameter);
            break;

        case 'movie-this':
            movieInfo(parameter);
            break;

        case 'do-what-it-says':
            getRandom();
            break;

        default:
            logIt("Invalid Instruction");
            break;

    }
};

function bandsInTown(parameter) {
    if (action === 'concert-this') {
        var movieName = "";
        for (var x = 3; x < process.argv.length; x++) {
            movieName += process.argv[x];
        } console.log(movieName);
    } else {
        movieName = parameter;
    }
    var queryURL = "https://rest.bandsintown.com/artists/" + movieName + "/events?app_id=9da298e4-a1bb-4504-924a-440ca32e6e02";

    request(queryURL, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var JS = JSON.parse(body);
            for (x = 0; x < JS.length; x++) {
                var dTime = JS[x].datetime;
                var month = dTime.substring(5, 7);
                var year = dTime.substring(0, 4);
                var day = dTime.substring(8, 10);
                var dateForm = month + "/" + day + "/" + year

                logIt("\n---------------------------------------\n");

                logIt("Date: " + dateForm);
                logIt("Name: " + JS[x].venue.name);
                logIt("City: " + JS[x].venue.city);
                if (JS[x].venue.region !== "") {
                    logIt("Country: " + JS[x].venue.region);
                }
                logIt("Country: " + JS[x].venue.country);
                logIt("\n---------------------------------------\n");
            }
        }
    });
}

function spotSong(parameter) {

    var searchTrack;
    if (parameter === undefined) {
        searchTrack = "The Sign by Ace of Base";
    } else {
        searchTrack = parameter;
    }

    spotify.search({
        type: 'track',
        query: searchTrack
    }, function (error, data) {
        if (error) {
            logIt("Error occured: " + error);
            return;
        } else {
            logIt("\n---------------------------------------\n");
            logIt("Artist: " + data.tracks.items[0].artists[0].name);
            logIt("Song: " + data.tracks.items[0].name);
            logIt("Preview: " + data.tracks.items[3].preview_url);
            logIt("Album: " + data.tracks.items[0].album.name);
            logIt("\n---------------------------------------\n");
        }
    });
};

function movieInfo(parameter) {

    var findMovie;
    if (parameter === undefined) {
        findMovie = "Mr. Nobody";
    } else {
        findMovie = parameter;
    };

    var queryURL = "http://www.omdbapi.com/?t=" + findMovie + "&y=&plot=short&apikey=15d4075a&";

    request(queryURL, function (err, res, body) {
        var bodyOf = JSON.parse(body);
        if (!err && res.statusCode === 200) {
            logIt("\n---------------------------------------\n");
            logIt("Title: " + bodyOf.Title);
            logIt("Release Year: " + bodyOf.Year);
            logIt("IMDB Rating: " + bodyOf.imdbRating);
            logIt("Rotten Tomatoes Rating: " + bodyOf.Ratings[1].Value);
            logIt("Country: " + bodyOf.Country);
            logIt("Language: " + bodyOf.Language);
            logIt("Plot: " + bodyOf.Plot);
            logIt("Actors: " + bodyOf.Actors);
            logIt("\n---------------------------------------\n");
        }
    });
};

function getRandom() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return logIt(error);
        }

        var dataArr = data.split(",");
        if (dataArr[0] === "spotify-this-song") {
            var songCheck = dataArr[1].trim().slice(1, -1);
            spotSong(songCheck);
        } else if (dataArr[0] === "concert-this") {
            if (dataArr[1].chartAt(1) === "'") {
                var dLength = dataArr[1].length - 1;
                var data = dataArr[1].substring(2, dLength);
                console.log(data);
                bandsInTown(data);
            } else {
                var bandName = dataArr[1].trim();
                console.log(bandName);
                bandsInTown(bandName);
            }
        } else if (dataArr[0] === "movie-this") {
            var movie_name = dataArr[1].trim().slice(1, -1);
            movieInfo(movie_name);
        }
    });
};

function logIt(dataToLog) {
    console.log(dataToLog);

    fs.appendFile("log.txt", dataToLog + "\n", function (err) {
        if (err) return logIt("Error logging datan to file: " + err);
    });
}

switchCase();