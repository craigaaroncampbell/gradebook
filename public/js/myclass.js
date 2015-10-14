'use strict';
///////////////// myClass Object /////////////////////////


var myClass = (function(){
  var properties = {
    getCounter : null,
    assignments : null,
    students : null,
    scores: null,
    points: function() {
      var total = 0;
      this.assignments.forEach(function(current, index, array){
        total += current.points
      });
      return total;
    }

  }
  return properties
})(); // end this module



