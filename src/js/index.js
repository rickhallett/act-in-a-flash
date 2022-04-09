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

        validate: function (options) {
            if (!_.isObject(options)) return;
            var { name, phase, card, body } = options;
            if (!name || !phase || !card || !body) {
                return 'All props are required;';
            }
        },
    });

    var Cards = Backbone.Collection.extend({
        model: Card,

        comparator: 'name',

        localStorage: new Backbone.LocalStorage('act-flash'),
    });

    var AppView = Backbone.Collection.extend({
        initialize: function () {
            var self = this;
            var cards = new Cards();

            cards.on('all', function (eventName) {
                console.log(
                    `%ccards event: %c${eventName}`,
                    'color:orange;',
                    'color:green;'
                );
            });

            cards.fetch({
                success: function (collection) {
                    console.log(
                        `cards fetched: ${Date.now()}`,
                        JSON.stringify(collection.toJSON(), null, 2)
                    );
                    self.collection = collection;
                    if (!collection.length) {
                        console.log('%c***ADDING SEED DATA***', 'color:red;');
                        self.restoreFromBackup();
                    }
                },
            });
        },

        addCard: function (newCard) {
            if (!newCard.isValid()) {
                throw new Error(newCard.validationError);
            }
            this.collection.create(newCard);
        },

        getBackup: function () {
            return JSON.stringify(this.collection.localStorage.findAll());
        },

        reset: function () {
            _.chain(this.collection.models)
                .map((model) => model)
                .each((model) => model.destroy());
        },

        restoreFromBackup: function () {
            _.each(BACKUP, (card) => this.collection.create(card));
        },

        printStorageTable: function () {
            console.table(this.collection.toJSON());
        },
    });

    /**
     * Console
     */

    var app = (window.app = new AppView());

    console.log({ app });
};
