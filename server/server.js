function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
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
                console.log(response.error);

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

                console.log('retrying');
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
    suggest: function (trackId, partyId) {
        var spotifyApi = new SpotifyWebApi();
        var trackResponse = apiWrap(spotifyApi.getTrack)(trackId, {});

        var track = trackResponse.data.body;
        track.id = trackId;
        track.partyId = partyId;

        var suggestion = Suggestions.findOne({ id: trackId, partyId: partyId });
        if (suggestion) {
            Meteor.call('upVote', suggestion._id);
            return false;
        } else {
            Suggestions.insert(track, function(err, id) {
                Meteor.call('upVote', id);
            });
            return true;
        }

        // TODO actually create playlist:

        // apiWrap(spotifyApi.createPlaylist)(Meteor.user().services.spotify.id, "Meteor Playlist", {public: false});
    },
    'newParty': function () {
        console.log("newParty called on server");
        if (!Meteor.userId()) {
            return false;
        }

        // generate new identifiers until we find one that is not in database
        var identifier;
        do {
            identifier = randomString(5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
            console.log(identifier);
            partyResult = Parties.find({identifier: identifier});
        } while (partyResult.count() > 0);

        Parties.insert({
            identifier: identifier,
            creator: Meteor.userId()
        });

        console.log('added!');
        console.log(identifier);

        return identifier;
    }
})
