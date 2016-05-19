import Ember from 'ember';
import ENV from 'bindfit-client/config/environment';

export default Ember.Controller.extend({
    // Default input values
    simpleSearchInput: "",
    emailInput: "",

    actions: {
        doSimpleSearch: function(callback) {
            var controller = this;

            var request = {
                "query": controller.get("simpleSearchInput")
            };

            console.log("actions.doSimpleSearch: request to send");
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
                console.log("actions.doSimpleSearch: $.ajax: search call success");
                console.log(data);

                // Set fit model properties with returned JSON
                controller.model.searchResult.setProperties(data);
            },
            function(error) {
                console.log("actions.doSimpleSearch: $.ajax: search call failed");
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
