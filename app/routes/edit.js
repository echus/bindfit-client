import Ember from 'ember';
import ENV from 'bindfit-client/config/environment';

import FitResult  from "../models/fit-result";
import FitLabels  from "../models/fit-labels";
import FitOptions from "../models/fit-options";
import FitExport  from "../models/fit-export";
import FitSave    from "../models/fit-save";

import objectListFilter from '../helpers/object-list-filter';

export default Ember.Route.extend({
    controllerName: "index",

    renderTemplate: function () {
        var controller = this.controllerFor("index");
        this.render("index", {controller: controller});
    },

    model: function(urlParams) {
        // Retrieve specified fit data from backend
        return Ember.$.getJSON(ENV.API.view+urlParams.id).then(function(response) {
            // Initialise full model for retrieved fit
            // (labels must be retrieved separately)

            var model = {
                fitID:      urlParams.id,
                fitEditKey: urlParams.key,

                fitList:    Ember.$.getJSON(ENV.API.list),

                fitOptions: FitOptions.create({}), // To be populated in
                                                   // setupController
                fitResult:  FitResult.create(response),

                fitLabels:  Ember.$.ajax({
                    url:  ENV.API.labels,
                    type: "POST",
                    data: JSON.stringify({fitter: response.fitter}),
                    contentType: "application/json; charset=utf-8",
                    dataType:    "json"
                    })
                    .then(function(data) {
                        return FitLabels.create(data);
                    }),
                
                fitExport:  FitExport.create({}),
                fitSave:    FitSave.create({})
            };

            return Ember.RSVP.hash(model);
        });
    },
    
    setupController: function(controller, model) {
        var selection = objectListFilter(model.fitList, 
                                         "key", 
                                         model.fitResult.fitter);

        // Select appropriate fitter
        controller.send('onFitterSelect', selection, model.fitResult);
        // Repopulate model (to avoid onFitterSelect resets)
        // TODO: instead of doing this, don't reset in first place if
        // fitResult provided to onFitterSelect?
        controller.set('model', model);
    }
});
