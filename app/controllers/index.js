import Ember from 'ember';
import ChartTheme from '../themes/bindfit-high-charts';

// Constants?
var root = "http://supramolecular.echus.co/bindfit/api/";

export default Ember.Controller.extend({
    // Highcharts theme
    chartTheme: ChartTheme,

    actions: {
        onFitterSelect: function(selection) {
            /*** 
             * On fitter select, populate fitOptions and fitLabels models
             * based on selection
             */

            console.log("actions.onFitterSelect: called");
            console.log("actions.onFitterSelect: selection");
            console.log(selection);

            var controller = this;

            // Clear any previous fit options, results and exports
            controller.get('fitResult').reset();
            controller.get('fitOptions').reset();
            controller.get('fitExport').reset();

            // If a fitter is selected (not undefined)
            // Populate fitOptions and fitLabels
            if (selection !== undefined) {
                console.log("actions.onFitterSelect: selection !== undefined");

                var request = {"fitter": selection};

                var promises = {
                    labels: Ember.$.ajax({
                        url:  root+"labels",
                        type: "POST",
                        data: JSON.stringify(request),
                        contentType: "application/json; charset=utf-8",
                        dataType:    "json"}),
                    options: Ember.$.ajax({
                        url:  root+"options",
                        type: "POST",
                        data: JSON.stringify(request),
                        contentType: "application/json; charset=utf-8",
                        dataType:    "json"})
                };

                Ember.RSVP.hash(promises).then(function(hash) {
                    controller.fitLabels.setProperties(hash.labels);
                    controller.fitOptions.setProperties(hash.options);
                    console.log("actions.onFitterSelect: RSVP succeeded");
                    console.log("actions.onFitterSelect: fitLables and fitOptions set");
                    console.log(controller.get("fitLabels"));
                    console.log(controller.get("fitOptions"));
                });
            }
        }, // onFitterSelect

        onUploadComplete: function(details) {
            // Set unique file id in fitOptions
            this.set('fitOptions.data_id', details.id);

            console.log("actions.onUploadComplete: called");
            console.log("actions.onUploadComplete: Updated fitOptions.data_id");
            console.log(this.get("fitOptions.data_id"));
        },

        onUploadRestart: function() {
            console.log("actions.onUploadRestart: called");

            // Clear any previous fit results and exports
            // Retain options
            this.get('fitResult').reset();
            this.get('fitExport').reset();
        },

        runFitter: function() {
            var controller = this;

            console.log("actions.runFitter: called");
            console.log("actions.runFitter: current fitOptions TO SEND");
            console.log(controller.get("fitOptions"));

            Ember.$.ajax({
                url:  root+"fit",
                type: "POST",
                data: JSON.stringify(controller.get("fitOptions")),
                contentType: "application/json; charset=utf-8",
                dataType:    "json"
            })
            .done(function(data) {
                console.log("actions.runFitter: $.ajax: bindfit call success");
                console.log(data);

                // Set fit model properties with returned JSON
                controller.fitResult.setProperties(data);

                console.log("actions.runFitter: $.ajax: fit model properties set");
                console.log(controller.fitResult);
            })
            .fail(function(data) {
                console.log("actions.runFitter: $.ajax: bindfit call failed");
                console.log(data);
            });
        }, // runFitter

        exportFit: function() {
            var controller = this;

            var request = {data: controller.get('fitResult')};

            // Send fitResult to backend for exporting
            Ember.$.ajax({
                url:  root+"export",
                type: "POST",
                data: JSON.stringify(request),
                contentType: "application/json; charset=utf-8",
                dataType:    "json"
            })
            .done(function(data) {
                // Set exported URL
                controller.fitExport.setProperties(data);
            })
            .fail(function(error) {
                console.log("actions.exportFit: $.ajax: bindfit call failed");
                console.log(error);
            });
        }, // exportFit

        downloadFit: function() {
            // Clear fitExport on download 
            this.get('fitExport').reset();
        }, // downloadFit

        saveFit: function() {
            var controller = this;

            var request = {
                result:  controller.get("fitResult"),
                options: controller.get("fitOptions"),
                metadata: {}
            };

            // Send fitResult to backend for exporting
            Ember.$.ajax({
                url:  root+"fit/save",
                type: "POST",
                data: JSON.stringify(request),
                contentType: "application/json; charset=utf-8",
                dataType:    "json"
            })
            .done(function(data) {
                console.log("actions.saveFit: $.ajax: save success");
                console.log(data);
            })
            .fail(function(error) {
                console.log("actions.saveFit: $.ajax: save fail");
                console.log(error);
            });
        } // saveFit
    }, // actions
});