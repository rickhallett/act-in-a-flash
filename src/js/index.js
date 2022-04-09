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
                phase: TYPES.PHASE.CREATIVE_HOPELESSNESS,
                card: TYPES.CARD.GOALS,
                body: null,
            };
        },
    });

    var Cards = Backbone.Collection.extend({
        model: Card,

        comparator: 'name',

        localStorage: new Backbone.LocalStorage('act-flash'),
    });

    var cards = new Cards();

    cards.on('all', function (eventName) {
        console.log(
            `%ccards event:emit %c${eventName}`,
            'color:yellow;',
            'color:green;'
        );
    });

    var c1 = new Card({
        id: Backbone.idGen(),
        phase: TYPES.PHASE.CREATIVE_HOPELESSNESS,
        card: TYPES.CARD.GOALS,
        name: 'Informed Consent',
        body: 'Gain informed consent and commitment to therapy',
    });

    var AppView = Backbone.Collection.extend({
        // el: null,

        initialize: function () {
            cards.fetch({
                success: function (collection) {
                    console.log(
                        `cards fetched: ${Date.now()}`,
                        JSON.stringify(collection.toJSON(), null, 2)
                    );
                },
                error: function (collection, response) {
                    console.log(`cards not fetched: ${Date.now()}`, {
                        collection,
                        response,
                    });
                },
            });
        },
    });

    var app = new AppView();
};
