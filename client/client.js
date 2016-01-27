Template.layout.helpers({
    partyId: function () {
        var party = Session.get('party');

        if (party) {
            return party.identifier;
        } else {
            return null;
        }
    }
});

function joinParty(partyCode) {
    console.log('party code entered by user: ' + partyCode);
    var party = Parties.findOne({identifier: partyCode});

    if (party) {
        console.log('found party');
        $(event.target).val('');
        Session.set('party', party);
        Router.go('/songQueue');
    } else {
        console.log('no such party found');
    }
}

function mainPageJoinPartyEventHandler(event) {
    var field = $("#access-code");
    var code = field.val();
    field.val('');
    joinParty(code);
}

Template.joinParty.events({
    "click #join-button": mainPageJoinPartyEventHandler,
    "keydown #access-code": function (event) {
        if (event.keyCode === 13) {
            mainPageJoinPartyEventHandler(event);
        }
    }
});

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

Template.mainMenu.events({
    "click #create-party-button": function (event) {
        console.log("create party clicked");
        Meteor.call("newParty", function (err, response) {
            console.log("Got new party response");
            if (err) {
                console.error(err);
            } else {
                if (response) {
                    Session.set('party', Parties.findOne({identifier: response}));
                    Router.go('/search');
                }
            }
        });
    }
});

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

        if (!Session.get('party')) {
            return;
        }

        Meteor.call('suggest', this.id, Session.get('party')._id, function (err, success) {
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
        return Suggestions.find();
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
          return Suggestions.find({partyId: Session.get('party')._id}, {sort: {score: -1}}) || {};
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
    "click .votes .up": function (event) {
        Meteor.call("upVote", this._id);
    },
    "click .votes .down": function (event) {
        Meteor.call("downVote", this._id);
    }
});

Template.create.events({
    "click #event-create": function (event) {
        console.log("Creating new party -- on client");
        Meteor.call("newParty", function (err, response) {
            console.log("Got new party response");
            if (err) {
                console.error(err);
            } else {
                if (response) {
                    $("#event-create-response").text('New event created! Share this ID with your friends: ' + response);
                    Session.set('party', Parties.findOne({identifier: response}));
                } else {
                    $("#event-create-response").text('Creation failed. You need to sign in to create an event.');
                }
            }
        });
    }
});

Template.join.events({
    'keydown #accessCode': function (event) {
        if (event.keyCode === 13) {
            console.log('pressed enter in access code');
            var partyCode = $(event.target).val();
            console.log('party code entered by user: ' + partyCode);
            var party = Parties.findOne({identifier: partyCode});

            if (party) {
                console.log('found party');
                $(event.target).val('');
                Session.set('party', party);
                Router.go('/songQueue');
            } else {
                console.log('no such party found');
            }
        }
    }
})
