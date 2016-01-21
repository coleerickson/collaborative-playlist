Suggestions = new Mongo.Collection("suggestions");

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
    suggest: function (uri) {
        Suggestions.insert({uri: uri});
    }
});
