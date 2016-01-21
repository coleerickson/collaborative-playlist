Suggestions = new Mongo.Collection("suggestions");

Router.route('/', function () {
  this.render('homePage');
  this.layout('layout');
});

Router.route('/search', function () {
  this.render('search');
  this.layout('layout');
});

Router.route('/songQueue', function () {
  this.render('songQueue');
  this.layout('layout');
});

if (Meteor.isServer) {
    Meteor.publish("suggestions",
        function () {
            return Suggestions.find();
        }
    );
}

if (Meteor.isClient) {
    Meteor.subscribe("suggestions");
}

Meteor.methods({
    search: function(query) {
        var response = {};

        var spotifyApi = new SpotifyWebApi();

        var tracksResponse = spotifyApi.searchTracks(query, {limit: 5});
        if (tracksResponse.error) {
            console.error(tracksResponse.error);
        } else {
            response.tracks = tracksResponse.data.body.tracks.items;
        }

        var albumsResponse = spotifyApi.searchAlbums(query, {limit: 5});
        if (albumsResponse.error) {
            console.error(albumsResponse.error);
        } else {
            response.albums = albumsResponse.data.body.albums.items;
        }

        var artistsResponse = spotifyApi.searchArtists(query, {limit: 5});
        if (artistsResponse.error) {
            console.error(artistsResponse.error);
        } else {
            response.artists = artistsResponse.data.body.artists.items;
        }

        return response;
    },
    suggest: function (trackId) {
        var spotifyApi = new SpotifyWebApi();
        var trackResponse = spotifyApi.getTrack(trackId, {});

        console.log("track response:");
        console.log(trackResponse);

        if (trackResponse.error) {
            console.error(trackResponse.error);
        } else {
            var track = trackResponse.data.body;
            Suggestions.insert(track);
        }
    }
});
