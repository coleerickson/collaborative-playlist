Template.body.events({
    'click #search-button': function(event) {
        // get query
        var query = $("#search-box").val();
        query = $.trim(query);

        // if the query is blank, don't continue
        if (query === "") {
            return;
        }

        // ask the server to retrieve Spotify results for the query
        Meteor.call('search', query, function (err, result) {
            if (err) {
                console.error(err);
            } else {
                console.log(result);
                Session.set("searchResults", result);
            }
        });

        // clear the search box
        $("#search-box").val('');
    },
    'click .track': function(event) {
        Session.set("spotifyUri", this.uri);
        console.log(this);
    }
});

Template.body.helpers({
    artists: function() {
        var results = Session.get("searchResults");
        console.log(results);
        if (!results) {
            return [];
        } else {
            return results.artists;
        }
    },

    tracks: function() {
        var results = Session.get("searchResults");
        console.log(results);
        if (!results) {
            return [];
        } else {
            return results.tracks;
        }
    },

    spotifyUri: function() {
        return Session.get("spotifyUri");
    }
});

Template.artist.helpers({
    image: function() {
        if (this.images.length > 0) {
            return this.images[this.images.length - 1].url;
        } else {
            /* TODO return placeholder */
        }
    }
});

Template.track.helpers({
    artist: function() {
        return this.artists.map(function (artist) {
            return artist.name
        }).join();
    },
    album: function() {
        return this.album.name;
    }
});
