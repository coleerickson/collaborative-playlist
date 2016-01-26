Template.navBar.helpers({
    activeFor: function (other) {
        if (Router.current().route.path() === other) {
            return "active";
        } else {
            return "";
        }
    }
});

function search() {
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
}

Template.search.events({
    'click #search-button': function(event) {
        search();
    },
    'keydown #search-box': function(event) {
        if (event.keyCode === 13) {
            search();
        }
    },
    'click .track': function(event) {
        Session.set("spotifyUri", this.uri);
        Meteor.call('suggest', this.id, function (err, success) {
            if (err) {
                console.error(err);
            } else {
                if (success) {
                    Router.go('/songQueue');
                }
            }
        });
    }
});

Template.search.helpers({
    suggestions: function () {
        return Suggestions.find({});
    },

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

Template.trackContents.helpers({
    artist: function() {
        return this.artists.map(function (artist) {
            return artist.name
        }).join(', ');
    },
    album: function() {
        return this.album.name;
    }
});

Template.songQueue.helpers({
      suggestions: function () {
          return Suggestions.find({}, {sort: {score: -1}}) || {};
      },
      artist: function() {
          return this.artists.map(function (artist) {
              return artist.name
          }).join(', ');
      },
      album: function() {
          return this.album.name;
      }
});

Template.trackSuggestion.events({
    "click .votes .up": function () {
        Meteor.call("upVote", this._id);
    },
    "click .votes .down": function () {
        Meteor.call("downVote", this._id);
    }
});
