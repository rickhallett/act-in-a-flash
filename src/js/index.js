window.onload = function (e) {
    //

    /**----------------------------------------------------------------------
                           
                            Console Utility Functions

     ----------------------------------------------------------------------*/

    var appStart = Date.now();

    var clearPending = false;
    
    var persistConsole = false;

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

    if (!persistConsole) queueClear = _.noop;

    //

    //

    //

    /**----------------------------------------------------------------------
                                   
                                    Constants

     ----------------------------------------------------------------------*/

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

    //

    //

    //

    /**----------------------------------------------------------------------

                                Backbone Models

     ----------------------------------------------------------------------*/

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

    //

    //

    //

    /**----------------------------------------------------------------------
     
                            Backbone Collections

     
     * * Presently one collection<Card> represents all stored data

     ----------------------------------------------------------------------*/

    var Cards = Backbone.Collection.extend({
        model: Card,

        comparator: 'name',

        localStorage: new Backbone.LocalStorage('act-flash'),
    });

    //

    //

    //

    /**----------------------------------------------------------------------
     
                                Backbone Views
      
     * * 'Views' responsibible for:
     *      - Listening to collection/model events as a controller
     *      - Providing an api to use in the console and, eventually, 
     *      - within HTML
     
     ----------------------------------------------------------------------*/

    var AppView = Backbone.View.extend({
        /**----------------------------------------------------------------------
         
                                Backbone Hook Functions

         ----------------------------------------------------------------------*/

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

            cards.on('change', function(card) {
                card.save();
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

        //

        //

        //

        /**----------------------------------------------------------------------
         
                                View API Functions

         ----------------------------------------------------------------------*/

        addCard: function (newCard) {
            if (!newCard.isValid()) {
                throw new Error(newCard.validationError);
            }
            if (this.nameIsUnique(newCard.get('name'))) {
                queueClear(15000);
                this.collection.create(newCard);
            }
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

        addNotesToCard: function(cardName, notes) {
            var isSingleNote = !Array.isArray(notes);
            var card = this.getCardByName(cardName);

            if (!card) throw new Error(`${cardName} does not exist`);

            var prevNotes = card.get('notes');

            if(isSingleNote) {
                console.log('%cProcessing single note', 'color: gray;')
                var note = notes;
                // debugger;

                if (prevNotes && prevNotes.includes(note)) {
                    throw new Error(`\n\nCard: '${cardName}'\nNote: '${note}' already exists\n`)
                }

                if (!prevNotes) {
                    console.log(`%cAdding first note: ${note}`, 'colour: green;')
                    card.set({notes: [note]});
                    return card;
                }

                console.log(`%cAdding ${note} to ${prevNotes}`, 'color: green;')
                card.set({notes: prevNotes.concat(note)});
                return card;                
            } else {
                console.log('%cProcessing batch notes', 'color: gray;')
                prevNotes = card.get('notes'); 

                if (prevNotes && _.intersection(prevNotes, notes).length) {
                    throw new Error(`\n\nCard: '${cardName}' already includes ${_.intersection(prevNotes, notes).length} of ${notes.length} notes:\n\n ${_.intersection(prevNotes, notes).map(function(n, i) {
                        return `${i+1} - ${n}`;
                    }).join('\n\n AND \n\n')}\n`)
                }

                if (!prevNotes) {
                    card.set({notes: notes});
                    return card;
                }

                card.set({notes: prevNotes.concat(notes)});
                return card;
            }
        },

        //

        //

        //

        /**----------------------------------------------------------------------
         
                            Collating Helper Functions

         ----------------------------------------------------------------------*/

        getCard: function (opts) {
            if (
                !_.isObject(opts) ||
                (!_.has(opts, 'id') && !_.has(opts, 'name'))
            )
                throw new Error('Invalid retrieval options');
            if (opts.id) return this.collection.get(opts.id);
            if (opts.name) return this.getCardByName(opts.name);
        },

        getCardByName: function (name) {
            return this.collection.findWhere({ name }) || undefined;
        },

        nameIsUnique: function (name) {
            if (this.collection.findWhere({ name: name })) {
                throw new Error(`'${name}' already exists.`);
            }
            return true;
        },

        listAllGoals: function () {
            return this.collection
                .where({ card: TYPES.CARD.GOALS })
                .map((card) => card.get('name'));
        },

        listAllStrategies: function () {
            return this.collection
                .where({ card: TYPES.CARD.STRATEGIES })
                .map((card) => card.get('name'));
        },

        listAllInterventions: function () {
            return this.collection
                .where({ card: TYPES.CARD.INTERVENTIONS })
                .map((card) => card.get('name'));
        },

        listAllByType: function (type) {
            return this.collection
                .where({ card: type })
                .map((card) => card.get('name'));
        },

        getCardsByPhase: function (phase) {},

        getCardsByGoal: function (goal) {},

        getCardsByStrategy: function (strategy) {},

        getCardsByIntervention: function (intervention) {},

        isCardOfStrategy: function (card, strategy) {},

        //

        //

        //

        /**----------------------------------------------------------------------
         
                        DB Relationship Helper Functions

         ----------------------------------------------------------------------*/

        getCardsWithoutLinksToGoals: function () {
            return this.collection.map((card) =>
                !card.get('linkedGoal') ? card : false
            );
        },

        aggregateStrategiesOf: function (goalName) {
            return this.collection.where({
                parent: this.getGoalByName(goalName).get('id'),
                card: TYPES.CARD.STRATEGIES,
            });
        },

        aggregateInterventionsOf: function (goalName) {
            return this.collection.where({
                parent: this.getGoalByName(goalName).get('id'),
                card: TYPES.CARD.INTERVENTIONS,
            });
        },

        getGoalByName: function (name) {
            return this.collection.findWhere({ name }) || undefined;
        },

        linkCardToGoal: function (cardName, goalName) {
            var card = this.getCard({ name: cardName });
            if (!card) throw new Error(`${cardName} not found`);

            var goal = this.getGoalByName(goalName);
            if (!goal) throw new Error(`${goalName} not found`);

            card.set({ parent: goal.get('id') });
            card.save();
        },

        goalExists: function (goal) {},

        getGoalById: function (attrs) {},

        getGoalByAttr: function (attrs) {},

        //

        //

        //

        /**----------------------------------------------------------------------
         
                          Localstorage Helper Functions

         ----------------------------------------------------------------------*/

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

    //

    //

    //

    /**----------------------------------------------------------------------
         
                            Global Namespace Helper Functions

         * Exposing Model/Collection/View internals to the global namespace

         ----------------------------------------------------------------------*/

    var app = (window.app = new AppView());
    var types = (window.types = TYPES);
    var card = (window.Card = Card);
    var cards = (window.Cards = Cards);
    var clear = (window.c = console.clear);
    var las = (window.las = app.listAllStrategies.bind(app));
    var lag = (window.lag = app.listAllGoals.bind(app));
    var lai = (window.lai = app.listAllInterventions.bind(app));
    var lctg = (window.lctg = app.linkCardToGoal.bind(app));
    var gbu = (window.gbu = app.getBackup.bind(app));
    var gcbn = (window.gcbn = app.getCardByName.bind(app))
    var antc = (window.antc = app.addNotesToCard.bind(app))
    var disableConsoleClear = window.disableConsoleClear = window.dcc = true;
    var appRef = window.app = {view: app,  goals: lag(), strategies: las(), interventions: lai(), store: localStorage}

    console.log(appRef)
};

//

//

//

/**
 * TODO LIST
 * 
 * [x] add sub-items to cards to allow for appending of notes contained with the book text; these can also be drilled
 *      [ ] this method probably doesn't need to throw errows, but console.warn instead
 *      [ ] it could also smartly add the elements of the notes array that dont already exist, and warn the others have not
 *          been duplicated
 *
 * build the functions that will enable the linking of cards to their
 * respective goals
 *
 *      goalExists(goal: string): boolean
 *
 *      getGoalId(name: string): string
 *
 *      getGoalByAttr(attr: obj): Card
 *
 * Error Handling
 *      Determine a pattern for error handling; what are the purposes of errors
 *      generated and how should they impact the exectution of the program.
 *
 *      Is it good practice to handle all errors even in small programs?
 */
