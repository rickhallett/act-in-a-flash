window.onload = function () {
    var appStart = Date.now();

    var clearPending = false;

    var getDelta = function () {
        return (Date.now() - appStart).toString() + 'ms';
    };

    var queueClear = function (t) {
        console.log(`%cConsole clear pending ${t}ms`, 'color:purple;');
        if (clearPending) clearTimeout(clearPending);
        clearPending = setTimeout(() => {
            clearPending = false;
            console.clear();
        }, t);
    };

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

    var AppView = Backbone.View.extend({
        initialize: function () {
            var self = this;
            var cards = new Cards();

            cards.on('all', function (eventName) {
                console.log(
                    `%ccards event: %c${eventName}`,
                    'color:orange;',
                    'color:green;',
                    getDelta(),
                    arguments[1].get('name') || '(Collection)'
                );
            });

            cards.fetch({
                success: function (collection) {
                    console.log(
                        `%ccards fetched: ${getDelta()}`,
                        'color: gray;'
                        // JSON.stringify(collection.toJSON(), null, 2)
                    );
                    self.collection = collection;
                    if (!collection.length) {
                        console.log('%c***ADDING SEED DATA***', 'color:red;');
                        self.restoreFromBackup();
                    }
                },
            });

            queueClear(10000);
        },

        //TODO: this is an unhandled error...
        addCard: function (newCard) {
            if (!newCard.isValid()) {
                throw new Error(newCard.validationError);
            }
            if (this.nameIsUnique(newCard.get('name'))) {
                queueClear(15000);
                this.collection.create(newCard);
            }
        },

        nameIsUnique: function (name) {
            if (this.collection.findWhere({ name: name })) {
                throw new Error(`'${name}' already exists.`);
            }
            return true;
        },

        editCard: function (card) {
            if (!newCard.isValid()) {
                throw new Error(newCard.validationError);
            }
            return this.collection.set(card);
        },

        editCardByName: function (cardName, attrs) {
            if (!_.isObject(attrs)) {
                throw new Error('Missing attribute modifiers');
            }
            try {
                this.collection.findWhere({ name: cardName }).set(attrs).save();
            } catch ({ name }) {
                if (name === TypeError().name) {
                    console.error(`'${cardName}' does not exist`);
                }
            }
        },

        getCardsByPhase: function (phase) {},

        getCardsByStrategy: function (strategy) {},

        getCardsByIntervention: function (intervention) {},

        isCardOfStrategy: function (card, strategy) {}, // ...

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
    var types = (window.types = TYPES);
    var card = (window.Card = Card);
    var cards = (window.Cards = Cards);
    var clear = (window.c = console.clear);

    console.log('app:', app);
};
