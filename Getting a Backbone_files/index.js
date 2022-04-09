window.onload = function () {
    var TYPES = {
        PHASE: {
            CREATIVE_HOPELESSNESS: 'CREATIVE_HOPELESSNESS',
        },
        CARD: {
            GOALS: 'GOALS',
            STRATEGIES: 'STRATEGIES',
            INTERVENTIONS: 'INTERVENTIONS',
            CLINICAL_FOCUS: 'CLINICAL_FOCUS',
        },
    };

    var Card = Backbone.Model.extend({
        defaults: function () {
            return {
                name: null,
                phase: null,
                card: null,
                body: null,
            };
        },

        validate: function (opts) {
            console.log(opts);
            // if ()
        },
    });

    var Cards = Backbone.Collection.extend({
        model: Card,

        comparator: 'name',

        localStorage: new Backbone.LocalStorage('act-flash'),
    });

    var AppView = Backbone.Collection.extend({
        // el: null,

        initialize: function () {
            var cards = new Cards();

            // cards.on('all', function (eventName) {
            //     console.log(
            //         `%ccards event:emit %c${eventName}`,
            //         'color:yellow;',
            //         'color:green;'
            //     );
            // });

            cards.on('add', function () {
                console.log('card added', JSON.stringify(this, null, 2));
            });

            var self = this;
            cards.fetch({
                success: function (collection) {
                    console.log(
                        `cards fetched: ${Date.now()}`,
                        JSON.stringify(collection.toJSON(), null, 2)
                    );
                    self.collection = collection;
                },
            });
        },

        addCard: function (props) {
            this.collection.create(props);
            return this;
        },
    });

    var app = (window.app = new AppView());
    console.log({ app });

    // Seed Data
    // var c1 = new Card({
    //     id: Backbone.idGen(),
    //     phase: TYPES.PHASE.CREATIVE_HOPELESSNESS,
    //     card: TYPES.CARD.GOALS,
    //     name: 'Informed Consent',
    //     body: 'Gain informed consent and commitment to therapy',
    // });

    var ic = new Card({
        id: Backbone.idGen(),
        phase: TYPES.PHASE.CREATIVE_HOPELESSNESS,
        card: TYPES.CARD.GOALS,
        name: 'Informed Consent',
        body: 'Gain informed consent and commitment to therapy',
    });

    var ic_s1 = new Card({
        id: Backbone.idGen(),
        phase: TYPES.PHASE.CREATIVE_HOPELESSNESS,
        card: TYPES.CARD.STRATEGIES,
        name: 'Necessary Knowledge',
        body: 'Develop knowledge necessary for informed consent',
    });

    var ic_s2 = new Card({
        id: Backbone.idGen(),
        phase: TYPES.PHASE.CREATIVE_HOPELESSNESS,
        card: TYPES.CARD.STRATEGIES,
        name: 'Therapy Contract',
        body: 'Develop therapy contract',
    });

    var noData = new Card();

    var seedData = (window.seedData = { ic, ic_s1, ic_s2, noData });
};
