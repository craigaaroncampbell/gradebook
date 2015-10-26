 'use strict';

/////////////  mongo DB ////////////

var mongo = (function(){
  var res = [];
  var database = {
    put:  function put(theData){
      $.ajax({
        url: 'https://api.mongolab.com/api/1/databases/gradebookproject/collections/myData/' + this.mongoID + '?apiKey=Q_MWxLPLxfonVusuXCHtaz6boo4vCKTN',
        data: JSON.stringify( { "$set" : theData }),
        type: "PUT",
        contentType: "application/json",
        success: console.log('Connected to mongoDB using mongo.' + this.name + '.put()' )
      });
    },

    get:function get(){
          $.ajax({
            url: 'https://api.mongolab.com/api/1/databases/gradebookproject/collections/myData/' + this.mongoID + '?apiKey=Q_MWxLPLxfonVusuXCHtaz6boo4vCKTN',

            type: 'GET',
            contentType: 'application/json',
            dataType: 'json',
            success: function(){
              console.log('Connected to mongoDB using mongo.' + this.name + '.get()')
            }.bind(this)

          })
          .done(function(response){
            this.response = response;

            if (this === mongo.students){
              res[0] = mongo.students.response;
              myClass.students = mongo.students.response.studentArray || [];
              myClass.students.forEach(function(current, index, array){
                Object.setPrototypeOf(current, Student.prototype);
              })
            }

            if (this === mongo.assignments){
              res[1] = mongo.assignments.response
              myClass.assignments = mongo.assignments.response.assignmentArray || [];
              myClass.assignments.forEach(function(current, index, array){
                Object.setPrototypeOf(current, Assignment.prototype);
              })
            }

            if (this === mongo.scores){
              res[2] = mongo.scores.response
              myClass.scores = mongo.scores.response.scoreArray || [];
              myClass.scores.forEach(function(current, index, array){
                Object.setPrototypeOf(current, Score.prototype);
              })
            }

            if (this === mongo.points) {
              res[3] = mongo.points.response
              myClass.points = mongo.points.response.totalPoints || 0;
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

  var points = Object.create(database, {
    'name' : { value: 'points' },
    'mongoID' : { value: '56005b32e4b0e6c040a24d34' },
    'response' : { value: null,
                   writable: true }
  });

  var students = Object.create(database, {
    'name' : { value: 'students' },
    'mongoID' : { value: '56005b32e4b0e6c040a24d36' },
    'response' : { value: null,
                   writable: true }
  });

  var scores = Object.create(database, {
    'name' : { value: 'scores' },
    'mongoID' : { value: '56005b32e4b099d78856fee9' },
    'response' : { value: null,
                   writable: true }
  });

  var assignments = Object.create(database, {
    'name' : { value: 'assignments' },
    'mongoID' : { value: '56005b32e4b0e6c040a24d35' },
    'response' : { value: null,
                   writable: true }
  });


return {points: points,
        students: students,
        scores: scores,
        assignments: assignments,
        res: res
      };
})(); // end mongo IFEE

!(function(){
  mongo.students.get();
  mongo.scores.get();
  mongo.assignments.get();
  mongo.points.get();
})()

