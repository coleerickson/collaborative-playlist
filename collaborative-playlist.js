Suggestions = new Mongo.Collection("suggestions");
Votes = new Mongo.Collection("votes");

Router.route('/', function () {
  this.render('main-menu');
  this.layout('homeLayout');
});

Router.onBeforeAction(function () {
    if (!Meteor.userId() && !Meteor.loggingIn()) {
        this.render('login');
        this.layout('homeLayout')
    } else {
        // required by Iron to process the route handler
        this.next();
    }
});

Router.route('/search', function () {
  this.render('search');
  this.layout('layout');
});

Router.route('/songQueue', function () {
  this.render('songQueue');
  this.layout('layout');
});

Router.route('/createParty', function () {
  this.render('createParty');
  this.layout('homeLayout');
});

Router.route('/joinParty', function () {
  this.render('joinParty');
  this.layout('homeLayout');
});

// catchall route
Router.route('/(.*)', function () {
    this.redirect('/');
});

if (Meteor.isServer) {
    Meteor.publish("suggestions",
        function () {
            return Suggestions.find();
        }
    );
    Meteor.publish("votes",
        function () {
            return Votes.find();
        }
    );
}

if (Meteor.isClient) {
    Meteor.subscribe("suggestions");
    Meteor.subscribe("votes");
}

// Wraps a Spotify API function. If the function call fails, this function
// will try to retrieve a new access token if appropriate and then retry the
// API call.
function apiWrap(f) {
    var wrapped = function(/* arguments */) {
        var response = f.apply(null, arguments);
        if (response.error) {
            // if we need to refresh the access token, do so and then try again
            if (response.error.statusCode === 401) {
                console.log("API call failed because we need a new access token. Refreshing token...");
                // refresh token
                var spotifyApi = new SpotifyWebApi();
                spotifyApi.refreshAndUpdateAccessToken(function (err, response) {
                    if (err) {
                        console.log("failed to refresh");
                        console.log(err);
                    } else {
                        console.log("succeeded refresh");
                        console.log(response);
                    }
                });

                // recursive retry
                return wrapped.apply(null, arguments);
            } else {
                // unknown error
                console.error("Failed. " + response.error);
                Meteor.Error("spotify-api-failure", "Error calling Spotify API method", response.error);
            }
        } else {
            return response;
        }
    }
    return wrapped;
}

Meteor.methods({
    search: function(query) {
        var response = {};

        var spotifyApi = new SpotifyWebApi();

        var tracksResponse = apiWrap(spotifyApi.searchTracks)(query, {limit: 7});
        response.tracks = tracksResponse.data.body.tracks.items;

        return response;
    },
    suggest: function (trackId) {
        var spotifyApi = new SpotifyWebApi();
        var trackResponse = apiWrap(spotifyApi.getTrack)(trackId, {});

        var track = trackResponse.data.body;

        var suggestion = Suggestions.findOne({ id: trackId });
        if (suggestion) {
            Meteor.call('upVote', suggestion._id);
        } else {
            Suggestions.insert(track, function(err, id) {
                Meteor.call('upVote', id);
            });
        }

        // TODO check for pre-existing suggestion

        // apiWrap(spotifyApi.createPlaylist)(Meteor.user().services.spotify.id, "Meteor Playlist", {public: false});
    },

    upVote: function (id) {
        var userId = Meteor.userId();
        if (!userId) {
            return;
        }

        Votes.upsert(
            { suggestion: id, user: userId },
            {
                $set: {
                    value: 1
                }
            }
        );

        var votes = Votes.find({ suggestion: id });
        var sum = 0;
        votes.forEach(function (vote) {
            sum += vote.value;
        });

        Suggestions.update(id, {
            $set: { score: sum }
        });
    },

    downVote: function (id) {
        var userId = Meteor.userId();
        if (!userId) {
            return;
        }

        Votes.upsert(
            { suggestion: id, user: userId },
            {
                $set: {
                    value: -1
                }
            },
        );

        var votes = Votes.find({ suggestion: id });
        var sum = 0;
        votes.forEach(function (vote) {
            sum += vote.value;
        });

        Suggestions.update(id, {
            $set: { score: sum }
        });
    }
})
