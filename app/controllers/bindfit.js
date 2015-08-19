import Ember from 'ember';

// Constants?
var root = "http://supramolecular.echus.co/bindfit/api/";

export default Ember.Controller.extend({
    // Variable to track whether a fitter is selected (used in displaying fit button)
    // No fitter selected initially
    fitterSelected: false,

    // Uploader setup
    uploadURL: root+"upload",
    uploadName: "input",

    // Highcharts setup
    chartOptions: {
        chart: {                                                               
            style: {'font-family': 'Lato, Helvetica, Arial, Verdana', 'text-transform': 'none'}
        },                                                                     
        title: {                                                               
            text: "",                                                          
        },                                                                     
        subtitle: {                                                            
            text: "",                                                          
        },                                                                     
        xAxis: {                                                               
            title: {                                                           
                text: "Equivalent total [G]\u2080/[H]\u2080"                   
            },                                                                 
            labels: {                                                          
                format: "{value}"                                              
            }                                                                  
        },                                                                     
        yAxis: { // Primary y axis                                            
            title: {                                                        
                text: "\u03B4", 
            },                                                              
            labels: {                                                       
                format: "{value} ppm"                                           
            },                                                              
            opposite: true,
            //minPadding: 0,                                                  
            //maxPadding: 0,                                                  
            //startOnTick: false,                                             
            //endOnTick: false                                                
        },                                                                 
        tooltip: {                                                          
            shared: true                                                    
        },                                                                  
	legend: {
            layout: 'horizontal',
            floating: true,
            align: 'left',
            verticalAlign: 'top',
            borderWidth: 0,
	},
    },

    chartTheme: {
        colors: ["#79BCB8", "#EE6C4D", "#0B4F6C", "#FA8334", "#197BBD", "#033860", "#47A8BD", "#1E3888"],
	chart: {
            marginTop: 50,
            backgroundColor: null,
            style: {'font-family': 'Lato, Helvetica, Arial, Verdana', 'text-transform': 'none'}
	},
	title: {
            style: {
                fontSize: '16px',
                fontWeight: 'bold',
            }
	},
	tooltip: {
            crosshairs: [true, false],
            borderWidth: 0,
            backgroundColor: 'rgba(219,219,216,0.8)',
            shadow: false
	},
	legend: {
            itemStyle: {
                fontWeight: 'bold',
                fontSize: '14px'
            }
	},
	xAxis: {
            gridLineWidth: 1,
            minorTickInterval: null,
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
	},
	yAxis: {
            gridLineWidth: 1,
            minorTickInterval: null,
            title: {
                style: {
                }
            },
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
	},
	plotOptions: {
            candlestick: {
                lineColor: '#404048'
            }
	}
    },

    // Computed property for displaying input and result parameters annotated 
    // with fitLabels
    fitResultParams: function() {
        // Getter
        var controller = this;

        var fitResult = controller.get("fitResult");
        var fitLabels = controller.get("fitLabels");

        // Create new list of combined results and labels
        var paramsLabelled = [];

        // If result exists
        if (fitResult.params) {
            for (var i = 0; i < fitResult.params.length; i++) {
                paramsLabelled.push({
                    "label": fitLabels.params[i].label,
                    "value": fitResult.params[i],
                    "units": fitLabels.params[i].units
                });
            }
        }

        return paramsLabelled;
    }.property("fitResult.params", "fitLabels.params"),

    fitOptionsParams: function(key, value) {
        var controller = this;

        var fitOptions = controller.get("fitOptions");
        var fitLabels  = controller.get("fitLabels");

        var i;

        // Setter
        // On fitOptionsParams change, update fitOptions.params list
        if (arguments.length > 1) {
            console.log("fitOptionsParams: setter called");

            // Create parameter value only list for fitOptions
            var params = [];

            if (fitOptions.params) {
                for (i = 0; i < fitOptions.params.length; i++) {
                    params.push(value.value);
                }
            }

            controller.set("fitOptions.params", params);
            console.log("fitOptionsParams: params set by user input");
            console.log(controller.get("fitOptions.params"));
        }

        // Getter
        // Create new list of combined results and labels
        var paramsLabelled = [];

        // If result exists
        if (fitOptions.params && fitLabels.params) {
            for (i = 0; i < fitOptions.params.length; i++) {
                paramsLabelled.push({
                    "label": fitLabels.params[i].label,
                    "value": fitOptions.params[i],
                    "units": fitLabels.params[i].units
                });
            }
        }

        return paramsLabelled;
    }.property("fitLabels.params.@each", "fitOptions.params.@each"),

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

            console.log("actions.onFitterSelect: fitOptionsParams");
            console.log(controller.get("fitOptionsParams"));

            // If a fitter is selected (not undefined)
            if (selection !== undefined) {
                console.log("actions.onFitterSelect: selection !== undefined");

                controller.set("fitterSelected", true);

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
            } else {
                // No fitter is selected
                console.log("actions.onFitterSelect: selection == undefined");
                controller.set("fitterSelected", false);
            }
        }, // onFitterSelect

        runFitter: function() {
            var controller = this;

            console.log("actions.runFitter: called");
            console.log("actions.runFitter: current fitOptions.params TO SEND");
            console.log(controller.get("fitOptions.params"));

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
                console.log("actions.runFitter: $.ajax: current fitOptions");
                console.log(controller.get("fitOptions"));

                // Set fit model properties with returned JSON
                controller.fitResult.setProperties(data);

                console.log("actions.runFitter: $.ajax: fit model properties set");
                console.log(controller.fitResult);
            })
            .fail(function(data) {
                console.log("actions.runFitter: $.ajax: bindfit call failed");
                console.log(data);
            });
        } // runFitter
    }, // actions



    //
    // Custom functions
    //

    parsers: {
        nmr1to1: function(params) {
            // Translate form to request
            var request = {
                "fitter": "nmr1to1",
                "input": {
                    "type": "csv",
                    "value": "input.csv"
                },
                "k_guess": params.kGuess
            };

            return request;
        },

        uv1to2: function(params) {
            var request = {
                "fitter": "uv1to2",
                "input": {
                    "type": "csv",
                    "value": "input.csv"
                },
                "k_guess": [params.k1Guess, params.k2Guess]
            };

            return request;
        }
    }
});
