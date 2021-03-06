import Ember from 'ember';

import objectListFilter from '../helpers/object-list-filter';

export default Ember.Object.extend({
    // JSON of options to be sent
    fitter: null,

    data_id: "",

    params: function() {
        // Computed property to return available unexcluded parameters
        
        var paramsList    = this.get("_paramsList");
        var excludeParams = this.get("_excludeParams");

        var params = {};

        console.log("fitOptions.params: called");
        console.log("fitOptions.params: current _paramsList");
        console.log(paramsList);
        console.log("fitOptions.params: current _excludeParams");
        console.log(excludeParams);

        // If paramsList is not null and there are parameters to exclude
        if (paramsList && excludeParams) {
            // For each parameter
            for (var key in paramsList) {
                // If param key is not excluded, append to params to return
                if (excludeParams.indexOf(key) === -1) {
                    params[key] = paramsList[key];
                }
            }
        } else {
            params = paramsList;
        }

        return params;
    }.property("_paramsList", "_excludeParams"),

    options: Ember.Object.extend({
        // Internal
        _flavourList:      null, // List of available flavours and their exclusions
        _flavourSelection: null,

        _methodList:       null, // List of available fitter methods
        _methodSelection:  null,

        flavour: function(key, value) {
            var _this = this;

            // Setter
            if (arguments.length > 1) {
                if (_this.get('_flavourList')) {
                    // Set _flavourSelection to selected flavour's full 
                    // selection object
                    let selection = objectListFilter(_this.get('_flavourList'), 
                                                     "key", 
                                                     value);
                    _this.set('_flavourSelection', selection);
                } else {
                    // No flavours listed, set to empty
                    _this.set('_flavourSelection', null);
                }

                console.log(_this.get('_flavourSelection'));
            }

            // Getter
            var flavour = this.get('_flavourSelection.key');

            if (!flavour) {
                // Default flavour value when none selected or no
                // flavours available
                flavour = null;
            }

            return flavour;
        }.property('_flavourSelection'),

        method: function(key, value) {
            var _this = this;

            // Setter
            if (arguments.length > 1) {
                if (_this.get('_methodList')) {
                    // Set _methodSelection to selected method's full 
                    // selection object
                    let selection = objectListFilter(_this.get('_methodList'), 
                                                     "name", 
                                                     value);
                    _this.set('_methodSelection', selection);
                } else {
                    // No methods listed, set to empty
                    _this.set('_methodSelection', null);
                }

                console.log(_this.get('_methodSelection'));
            }

            // Getter
            var method = this.get('_methodSelection.name');

            if (!method) {
                // Default method value when none selected or no
                // methods available
                method = null;
            }

            return method;
        }.property('_methodSelection'),

        normalise: null,
        dilute: null
    }).create(),

    labels: null,



    // Internal
    // Keys to be parsed and stringified by _toJSON
    _jsonKeys:      ["fitter", 
                     "data_id", 
                     "params", 
                     {"options": ["flavour", 
                                  "method", 
                                  "normalise", 
                                  "dilute"]}, 
                     "labels"],

    _paramsList:    null, // Stores list of all available parameters
    _excludeParams: null, // Stores list of parameters to exclude from display
                         // and sending 
                         // (updated in fit-options-form.onOptionFlavourSelect)

    _setParamsLabelled: function(list) {
        /***
         * Manually set params from paramsLabelled computed property changes
         * Called by watchParamsLabelled observer in index controller
         */
        var _this = this;
        
        list.forEach(function(param) {
            _this.set("_paramsList."+param.key+".init",   parseFloat(param.value)); 
            _this.set("_paramsList."+param.key+".bounds", param.bounds); 
        });
    },

    _paramsLabelled: function(labels) {
        /***
         * Array of labelled parameters for display in template.
         * Note: getter only! Binding to object properties in array doesn't 
         * work w/ input helper. See workaround setter in setParamsLabelled.
         */

        var params        = this.get("params");

        // Null check
        if (!params) {
            return [];
        }

        console.log("fitOptions.paramsLabelled: called");
        console.log("fitOptions.paramsLabelled: labels");
        console.log(labels);
        console.log("fitOptions.paramsLabelled: params");
        console.log(params);

        var paramsArray = [];

        // Sort keys to display in order
        var sortedKeys = Object.keys(params).sort();

        // Populate parameter aray
        sortedKeys.forEach(function(key) {
            if (params.hasOwnProperty(key)) {
                // Ensure labels has been updated
                if (labels.hasOwnProperty(key)) {
                    paramsArray.push({
                        key:    key,
                        label:  labels[key].label,
                        units:  labels[key].units,
                        value:  params[key].init,
                        bounds: params[key].bounds
                    });
                }
            }
        });

        return paramsArray;
    },

    _reset: function() {
        this.setProperties({
            fitter: null,
            data_id: "",
            options: null,

            paramList:     null,
            excludeParams: null,
            flavourList:   null
        });
    },

    _isPopulated: function() {
        console.log("fitOptions.isPopulated: called");
        console.log(this);
        return this.get("fitter");
    }.property("fitter", "data_id", "params", "options"),

    _hasData: function() {
        /***
         * Returns true if data has been uploaded
         */
        return this.get("data_id");
    }.property("fitter", "data_id"),

    _noFit: function() {
        /***
         * Returns true if no fit requested (save data only option)
         */

        // Check fitter isn't null
        if (this.get("fitter")) { 
            // If fitter name contains "data"
            if (this.get("fitter").indexOf("data") > -1) {
                // Save data only
                return true;
            } else {
                // Full fit
                return false;
            }
        }
    }.property("fitter"),

    _toJSON: function(noStringify) {
        console.log("fitOptions._toJSON: called");

        var _this = this;
        
        var json = {};
        _this.get("_jsonKeys").forEach(function(key) {
            if (typeof key === 'object') {
                // Hack to deal with nested Ember object for options
                Object.keys(key).forEach(function (k) {
                    console.log("KEY (OBJ): "+key);
                    json[k] = {};
                    key[k].forEach(function (subk) {
                        console.log("SUBKEY: "+subk);
                        json[k][subk] = _this.get(k+"."+subk);
                        console.log("subkey written: "+_this.get(k+"."+subk));
                    });
                });
            } else {
                console.log("KEY: "+key);
                json[key] = _this.get(key);
            }
        });
        
        console.log("fitOptions._toJSON: JSON to send");
        console.log(json);

        if (noStringify) {
            return json;
        } else {
            return JSON.stringify(json);
        }
    }
});
