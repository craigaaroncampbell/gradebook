 'use strict';

///////////// Main  calls to Mongo DB ////////////

var main = (function(){
  var mongo = {
    put:  function put(theData){
      $.ajax({
        url: 'https://api.mongolab.com/api/1/databases/gradebookproject/collections/myData/' + this.mongoID + '?apiKey=Q_MWxLPLxfonVusuXCHtaz6boo4vCKTN',
        data: JSON.stringify( { "$set" : theData }),
        type: "PUT",
        contentType: "application/json",
        success: console.log('Connected to MongoDB using main.' + this.name + '.put()' )
      });
    },

    get:function get(){
          $.ajax({
            url: 'https://api.mongolab.com/api/1/databases/gradebookproject/collections/myData/' + this.mongoID + '?apiKey=Q_MWxLPLxfonVusuXCHtaz6boo4vCKTN',

            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            success: function(){
              console.log('Connected to MongoDB using main.' + this.name + '.get()')
            }.bind(this)

          })
          .done(function(response){
            this.response = response;

            if (this === main.students){
              myClass.students = main.students.response.studentArray || [];
              myClass.students.forEach(function(current, index, array){
                Object.setPrototypeOf(current, Student.prototype);
              })
            }

            if (this === main.assignments){
              myClass.assignments = main.assignments.response.assignmentArray || [];
              myClass.assignments.forEach(function(current, index, array){
                Object.setPrototypeOf(current, Assignment.prototype);
              })
            }

            if (this === main.scores){
              myClass.scores = main.scores.response.scoreArray || [];
              myClass.scores.forEach(function(current, index, array){
                Object.setPrototypeOf(current, Score.prototype);
              })
            }

            if (this === main.points) {
              myClass.points = main.points.response.totalPoints || 0;
            }

            if (myClass.getCounter === undefined) {
              myClass.getCounter = 1;
            }
            else {
              myClass.getCounter ++;
            }
            if (myClass.getCounter === 4){ // once all 4 get requests have received a response...
              return renderAll();
            }

          }.bind(this))
    }
  }

  var points = Object.create(mongo, {
    'name' : { value: 'points' },
    'mongoID' : { value: '56005b32e4b0e6c040a24d34' },
    'response' : { value: null,
                   writable: true }
  });

  var students = Object.create(mongo, {
    'name' : { value: 'students' },
    'mongoID' : { value: '56005b32e4b0e6c040a24d36' },
    'response' : { value: null,
                   writable: true }
  });

  var scores = Object.create(mongo, {
    'name' : { value: 'scores' },
    'mongoID' : { value: '56005b32e4b099d78856fee9' },
    'response' : { value: null,
                   writable: true }
  });

  var assignments = Object.create(mongo, {
    'name' : { value: 'assignments' },
    'mongoID' : { value: '56005b32e4b0e6c040a24d35' },
    'response' : { value: null,
                   writable: true }
  });


return {points: points,
        students: students,
        scores: scores,
        assignments: assignments
      };
})(); // end main IFEE

!(function(){
  main.students.get();
  main.scores.get();
  main.assignments.get();
  main.points.get();
})()

