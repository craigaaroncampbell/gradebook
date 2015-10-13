'use strict';
///////////////// myClass Object /////////////////////////

var myClass = (function(){
  var classPeriod = {
    getCounter : null,
    assignments : null,
    students : null,
    scores: null,
    pointsPossible: function() {
      var total = 0;
      this.assignments.forEach(function(current, index, array){
        total += current.points
      });
      return total;
    }
  }
  return classPeriod
})(); // end myclass module



