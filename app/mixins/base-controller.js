import Ember from 'ember';

import { fitDataSlice, fitDataFilter } from '../utils/fit-data';

export default Ember.Mixin.create({
  // Pagination
  NUMBER_ROWS_PAGE: 5,
  currentPage: 1,
  //countPages: 0, // set onUploadComplete
 
  // picker: false
  // pager: true
  // because i'm an idiot
  usePicker: true,


  selectedFits: [],
  selectedResults: [],

  paramsLabelled: function() {
      /***
       * Compute array of labelled parameters for display in template
       */
      var labels = this.get("model.fitLabels.fit.params");
      return this.get("model.fitResult").paramsLabelled(labels);
  }.property("model.fitResult.fit.params", "model.fitLabels.fit.params"),

  fitResults: function() {
    return this.get("model.fitResult");
  }.property("model.fitResult.data.y"),

  dataBrowserVisible: function() {
    var numberFits = this.get("numberFits");

    if (numberFits <= 5) {
      return false;
    } else {
      return true;
    }
  }.property("numberFits"),

  numberFits: function() {
    var fitResult = this.get("fitResults");

    if (!fitResult) {
      return 0;
    }
    
    if (!fitResult.labels.data.y) {
      return 0;
    } else {
      return fitResult.labels.data.y.row_labels.length;
    }
  }.property("fitResults"),

  startIndex: function() {
    var currentPage = this.get("currentPage");
    var n = this.get("NUMBER_ROWS_PAGE");

    return (currentPage-1)*n; 
  }.property("currentPage", "countPages"),
  
  endIndex: function() {
    var startIndex = parseInt(this.get("startIndex"), 10);
    var n = parseInt(this.get("NUMBER_ROWS_PAGE"), 10);

    return (startIndex + n); // +1 ?? 
  }.property("currentPage", "countPages", "startIndex", "NUMBER_ROWS_PAGE"),
 
  countPages: function() {
    this.set("currentPage", 1);
    var numberFits = this.get("numberFits");

    var NUMBER_ROWS_PAGE = this.get("NUMBER_ROWS_PAGE");
    var numberPages = parseInt(numberFits / NUMBER_ROWS_PAGE, 10);

    return numberPages; 
  }.property("numberFits", "NUMBER_ROWS_PAGE"),

  pagedFitResults: function() {
      var usePicker = this.get("usePicker");
      var fitResult = this.get("fitResults");
      var numberFits = this.get("numberFits");
     
      // early bail out!
      if (!numberFits) {
          return fitResult;
      }

      if (usePicker) {
        var startIndex = this.get("startIndex"); 
        var endIndex = this.get("endIndex");

        var paged = fitDataSlice(fitResult, startIndex, endIndex);

      } else {
        var selectedFits = this.get("selectedFits");
        
        var rowLabels = fitResult.labels.data.y.row_labels; 

        var selectedFitsIndices = selectedFits.map(function(x) {
          return rowLabels.indexOf(x);  
        });

        var paged = fitDataFilter(fitResult, selectedFitsIndices);
      }

      return paged;
  }.property("currentPage", "selectedFits.[]", "NUMBER_ROWS_PAGE", "usePicker",
            "numberFits"),
});
