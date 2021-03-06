import Ember from 'ember';
import ENV from 'bindfit-client/config/environment';

export default Ember.Controller.extend(Ember.Evented, {
    fitterSelection: null,

    advanced: false,

    // Default input values
    simpleSearchInput: "",
    emailInput: "",

    actions: {
        toggleAdvanced: function() {
            // Toggle advanced flag
            var advanced = this.get('advanced');
            this.set('advanced', !advanced);
        },
       
        onFitterSelect: function(selection) {
            /*** 
             * On fitter select, populate searchOptions and fitLabels models
             * based on selection.
             */

            var controller = this;

            // If a fitter is selected (not undefined)
            // Pre-populate searchOptions and fitLabels for this selection
            if (selection !== undefined) {
                this.set('fitterSelection', selection);

                var request = {"fitter": selection.key};

                var promises = {
                    labels: Ember.$.ajax({
                        url:  ENV.API.labels,
                        type: "POST",
                        data: JSON.stringify(request),
                        contentType: "application/json; charset=utf-8",
                        dataType:    "json"}),
                    options: Ember.$.ajax({
                        url:  ENV.API.searchOptions,
                        type: "POST",
                        data: JSON.stringify(request),
                        contentType: "application/json; charset=utf-8",
                        dataType:    "json"})
                };

                Ember.RSVP.hash(promises).then(function(hash) {
                    controller.model.fitLabels.setProperties(hash.labels);
                    var flavourList = null;
                    var methodList  = null;
                    var paramsList  = null;

                    // Save lists of available options
                    flavourList = hash.options.options.flavour;
                    methodList  = hash.options.options.method;
                    paramsList  = hash.options.params;

                    // Reset default selected options
                    hash.options.options.flavour = "";
                    hash.options.options.method = "";
                    delete hash.options.params; // Computed from paramsList

                    // Populate selection lists
                    controller.set("model.searchOptions.options._flavourList", flavourList);
                    controller.set("model.searchOptions.options._methodList",  methodList);
                    controller.set("model.searchOptions._paramsList",  paramsList);

                    // Set options manually as nested object to avoid 
                    // overwriting computed props
                    controller.model.searchOptions.set('options.flavour', hash.options.options.flavour);
                    controller.model.searchOptions.set('options.method', hash.options.options.method);
                    controller.model.searchOptions.set('options.normalise', hash.options.options.normalise);
                    controller.model.searchOptions.set('options.dilute', hash.options.options.dilute);

                    delete hash.options.options;

                    // Set rest of properties in bulk
                    controller.model.searchOptions.setProperties(hash.options);

                    // Initialise labelled parameter array in fit options form
                    controller.trigger('fitterSelect');
                });
            }
        },

        doSearch: function(callback) {
            var controller = this;

            var request = null;

            if (controller.get('advanced')) {
                // Advanced search
                console.log("Advanced search clicked");

                request = {
                    "query": controller.get('model.searchOptions')._toJSON(true)
                };

                request.query.text = controller.get("simpleSearchInput");
            } else {
                // Simple search
                request = {
                    "query": controller.get("simpleSearchInput")
                };
            }

            console.log("actions.doSearch: request to send");
            console.log(request);

            var promise = new Ember.RSVP.Promise(function(resolve, reject) {
                Ember.$.ajax({
                    url:  ENV.API.search,
                    type: "POST",
                    data: JSON.stringify(request),
                    contentType: "application/json; charset=utf-8",
                    dataType:    "json"
                })
                .done(resolve)
                .fail(reject);
            });

            // For async button
            callback(promise);

            promise.then(
            function(data) {
                console.log("actions.doSearch: $.ajax: search call success");
                console.log(data);

                // Set fit model properties with returned JSON
                controller.model.searchResult.setProperties(data);
            },
            function(error) {
                console.log("actions.doSearch: $.ajax: search call failed");
                console.log(error);
            });
        },

        doEmailSearch: function(callback) {
            var controller = this;

            var request = {
                "view_url": ENV.viewURL,
                "email": controller.get("emailInput")
            };

            console.log("actions.doEmailSearch: request to send");
            console.log(request);

            var promise = new Ember.RSVP.Promise(function(resolve, reject) {
                Ember.$.ajax({
                    url:  ENV.API.email,
                    type: "POST",
                    data: JSON.stringify(request),
                    contentType: "application/json; charset=utf-8",
                    dataType:    "json"
                })
                .done(resolve)
                .fail(reject);
            });

            // For async button
            callback(promise);

            promise.then(
            function(data) {
                console.log("actions.doSearch: $.ajax: search call success");
                console.log(data);

                // Set fit model properties with returned JSON
                // controller.model.fitResult.setProperties(data);
            },
            function(error) {
                console.log("actions.runFitter: $.ajax: bindfit call failed");
                console.log(error);
            });
        },
    }
});
// vim: set ts=4:
