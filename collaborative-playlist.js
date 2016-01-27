Suggestions = new Mongo.Collection("suggestions");
Votes = new Mongo.Collection("votes");
Parties = new Mongo.Collection("parties");

Router.route('/', function () {
  this.render('mainMenu');
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

Router.route('/about', function() {
  this.render('about');
  this.layout('layout');
});

Router.route('/create', function() {
  this.render('create');
  this.layout('layout');
})

Router.route('/join', function() {
  this.render('join');
  this.layout('layout');
})

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
    Meteor.publish("parties",
        function () {
            return Parties.find();
        }
    );
}

if (Meteor.isClient) {
    Meteor.subscribe("suggestions");
    Meteor.subscribe("votes");
    Meteor.subscribe("parties");
}

Meteor.methods({
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
