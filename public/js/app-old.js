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


/////////////////// Student Object ////////////////////

function Student(studentName, score){
  this.studentName = studentName;
  this.totalScore = score || 0;
}

(function(){ // add methods to Student.prototype
  this.addPoints = function(points){
     return this.totalScore += points || 0; // add no points if not specified

  }

  this.removePoints = function(points){
     return this.totalScore -= points || 0; //add no points if not specified
  }

  this.getPercentScore = function(){
    this.percentGrade = ((this.totalScore / myClass.points) * 100).toFixed(2);
    if (myClass.points === 0) {
      this.percentGrade = 0; // so it shouldn't ever be "NaN"
    }
  }

  this.getLetterGrade = function() {
    if (this.percentGrade >= 90){this.letterGrade = "A";}
    else if (this.percentGrade >= 80){this.letterGrade = "B";}
    else if (this.percentGrade >= 70){this.letterGrade = "C";}
    else if (this.percentGrade >= 60){this.letterGrade = "D";}
    else if (this.percentGrade < 60){this.letterGrade = "F";}
    else {this.letterGrade = "Houston, we have a problem.";} // If I get this then I know there's a bug!
  }

  this.addStudent = function(){  // adds student to myClass.students
    var studentMatch = false;
    var storedStudentName = this.studentName;
    myClass.students.forEach(function(current, index, array){
      if (current.studentName === storedStudentName) {
        console.log("we got a match for " + storedStudentName );
        studentMatch = true; //if student is already in list then change studentMatch to true
      }
    }) // end forEach
    if (!studentMatch) { // if no match, then add to list and update database
      myClass.students.unshift(this);
      main.students.put({ "studentArray" : myClass.students });
    }
  }
}).call(Student.prototype);


///////////////// Score Object //////////////////

function Score(scoreName, score){
  this.scoreName = scoreName;
  this.score = score || 0;
}

Score.prototype.updateScore = function(scoreValue){
  return this.score = scoreValue;
}


/////////// Assignment Object//////////////////////

function Assignment(assignmentName, points){
  this.assignmentName = assignmentName;
  this.points = points;
}

Assignment.prototype.addAssignment = function(){
  var assignmentMatch = false; //first assume the new assignment is NOT in the list already
  var storedAssignmentName = this.assignmentName;
  myClass.assignments.forEach(function(current, index, array){ //check to see if assignmet is in list
    if (current.assignmentName === storedAssignmentName) {
      console.log("we got a match for " + storedAssignmentName);
      assignmentMatch = true; // assignment was in the list
    }
  }) // end forEach
  if (!assignmentMatch) { // if no match for that assignment name, then put the assignment in the list and update points and database
    myClass.assignments.unshift(this);
    console.dir(myClass.assignments)
    myClass.points += this.points
    main.assignments.put({ "assignmentArray" : myClass.assignments });
    main.points.put({ "totalPoints" : myClass.points });
    }
};

/////////////////////// Rendering Stuff ////////////////


function renderAll(){
  alphabetizeStudents();
  renderStudents();
  renderAssignments();
}

function properCapitalization(input){
  var re = /(\b[a-z](?!\s))/g; // finds first letter of words, after dashes, and punctuation so that they can be capitalized
  var noSpace = input.replace(/\s/g, "-" ) //replaces whitespace with dash
  return noSpace.replace(re, function(x){
    return x.toUpperCase();
  });

  // return noSpace.slice(0,1).toUpperCase() + noSpace.slice(1).toLowerCase();
} //makes 1st letter capitalized, and rest lowercase regardless of input capitalization; this will be important for alphabetizing as ASCII numbers for lowercase "a" is actually HIGHER than for uppercase "Z", and my method of comparing compares ASCII values

function renderStudents(){
  $('tr').find('.student').parent().remove(); //remove ALL tr with student class children
  for (var i = 0; i < myClass.students.length; i++){
    myClass.students[i].getPercentScore();
    myClass.students[i].getLetterGrade();

    $('#table').append('<tr><td class="editable student students" id="'  + myClass.students[i].studentName + '">' + myClass.students[i].studentName + '</td> <td class="grade grades" id="letterGrade' + myClass.students[i].studentName+'">' + myClass.students[i].letterGrade + '</td> <td class ="grade grades" id="percentGrade'+ myClass.students[i].studentName +'">' + myClass.students[i].percentGrade + ' %</td></tr>');
  }
}

function renderAssignments(){
  var scoreYet, id, nameOfStudent, placeholder, i, j, k;
  $('.assignment').remove();
  for (i = 0; i < myClass.assignments.length; i++){ // go through assingment list
    for (j = 0; j < myClass.students.length; j++) { // for EACH assignment, go through student list and make a new TD with student-assignment id
      if (myClass.scores[0] !== undefined) { // if there are score objects in the score array already, then go through the k loop
        for (k = 0; k < myClass.scores.length; k++){
          scoreYet = false;
          if (myClass.scores[k].scoreName.slice(0, -myClass.assignments[i].assignmentName.length) === myClass.students[j].studentName && myClass.scores[k].scoreName.slice(myClass.students[j].studentName.length) === myClass.assignments[i].assignmentName){
            if (myClass.scores[0]!== undefined){
              placeholder = myClass.scores[k].score
            }
            nameOfStudent = myClass.students[j].studentName
            id = nameOfStudent + myClass.assignments[i].assignmentName
            $('#percentGrade' + nameOfStudent).after('<td class="editable score" id="'+ id + '">'  + placeholder + '</td>'); // render assignment score box with unique id for student/assignment combo
            scoreYet = true;
            break; // break the k loop for the current student...
          }
          else {
            scoreYet = false;
          }  // continue iterating until either all scores objects have been checked or  one is found (and break is done)
        } // end k loop  for the current student (iteration of j loop) if  break wasn't done already
      }
      else{
        scoreYet = false;
      }
      if (scoreYet === false){
          placeholder = '';
          nameOfStudent = myClass.students[j].studentName
          id = nameOfStudent + myClass.assignments[i].assignmentName
          $('#percentGrade' + nameOfStudent).after('<td class="editable score" id="'+ id + '">'  + placeholder + '</td>'); // render an empty assignment score box with unique id for student/assignment combo (only if there wasn't a score object found to match )
      } // ok now go on to the next student and run though the k loop again
    } // end j loop  (move on to next assignemnt to render)

    $('#gradePercent').after('<th class="editable assignment" id=' + myClass.assignments[i].assignmentName +'>' + myClass.assignments[i].assignmentName + '<br><table><tr><td class="editable assignmentPoints" id="points' + myClass.assignments[i].assignmentName + '">' + myClass.assignments[i].points +' pts</td></tr></table></th>'); //put new table header  with assignemnt name after the  grade percent column
  } // end i loop
}


function alphabetizeStudents(){
  var i, changeCounter;
  if (myClass.students.length > 1){
    while (true){
      changeCounter = 0;
      for (i = 0; i < myClass.students.length - 1 ; i++){ // length-1 becasue we do the last comparison on the next-to-last index
        if (myClass.students[i+1].studentName < myClass.students[i].studentName){ //if 2 consecutive students are NOT in alphabetical order then...
          let higherAlphabet = myClass.students[i];  //store the higher value
          let lowerAlphabet = myClass.students[i+1]; //store the lower value
          myClass.students[i] = lowerAlphabet;  //swap the two values
          myClass.students[i+1] = higherAlphabet;
          changeCounter ++;
        }
      } // end for loop
      if (changeCounter === 0){
        break;
        } // at end of each iteration though the while loop, check if any changes were made to alphaetical list during that iteration. If not, then it is finally alphabetized so end loop.
    }//end while loop
  }
}


//////////////////// Edit Data ///////////////////////////

function editCells(formerStudentText, formerAssignmentText, removeThisManyPoints){
  var found = false, pointsToAdd;
  $('.clicked').text(''); // clear the old text
  $('<input>').attr({ type: 'text', id: 'editing'}).appendTo('.clicked'); // insert a text input box
  $('#editing').focus(); //put focus on the new text input box

  $('#editing').on('blur', function(){
    var editValue = properCapitalization($('#editing').val());
    if (editValue === ' '){ // string with a space has length of 1
      editValue = ''; //so set it to empty string with lenght of 0
    }
    if (editValue.length > 0){ //so empty string will not work! Thus blanks won't run!
      $('.clicked').text(editValue); //set new table cell text

      //for editing assignments:
      if ($('.clicked').is($('.assignment'))) {   // if cell is assignment class)
        $('.clicked').attr('id', editValue); // set id to the edited value
        myClass.assignments.forEach(function(current, index, array){
          if (current.assignmentName === editValue){ //if this new edited value   WAS already in the assignment list then don't change anything! make it its original value. no duplicates!
          console.log("that was already in the list! So we're not changing anything!")
          }
        }) // end for Each

        if (found === false) {  // if it was NOT already there, then change the assignment name and list
          myClass.assignments.forEach(function(current, index, array){
            if (current.assignmentName === formerAssignmentText){
              myClass.assignments[index].assignmentName = editValue //then replace that index value with the new ones
            }
          }) //end forEach
        }
          main.assignments.put({ "assignmentArray" : myClass.assignments });

          myClass.scores.forEach(function(current, index, array){
            if (current.scoreName.slice(-(formerAssignmentText.length)) === formerAssignmentText ){  // if the first part of the scoreName matches the name of the assignment that was JUST changed (the old name not the new one), then replace the first part of scoreName with the NEW name
              current.scoreName = current.scoreName.slice(0, (current.scoreName.length - formerAssignmentText.length)) + editValue;
            }
          })
          main.scores.put({ "scoreArray" : myClass.scores });

        $('.clicked').removeClass('clicked'); //remove clicked class
      } // end if assignment

      // for editing student names
      else if ($('.clicked').is($('.student'))) {   // if cell is student class)
        $('.clicked').attr('id', editValue); // set id to the edited value
        myClass.students.forEach(function(current, index, array){
          if (current.studentName === editValue){ //if this new edited value   WAS already in the student list then don't change anything! make it its original value. no duplicates!
            console.log("that was already in the list! So we're not changing anything!")
            found = true;  // if any of them match, then the found state will be "true"
          }
        }) //end forEach

        if (found === false) {
          // if it was NOT already there, then change the student name and list by CHANGING the studentName on that object that USED TO match the clicked cell's name
          myClass.students.forEach(function(current, index, array){
            if (current.studentName === formerStudentText) { // find the student name that matches the old text of the clicked cell
              myClass.students[index].studentName = editValue; //change the matching student name to the edit value
            }
          }) // end forEach
          main.students.put({ "studentArray" : myClass.students });

          myClass.scores.forEach(function(current, index, array){
            if (current.scoreName.slice(0, formerStudentText.length) === formerStudentText ){  // if the first part of the scoreName matches the name of the student who was JUST changed (the old name not the new one), then replace the first part of scoreName with the NEW name
              current.scoreName = editValue + current.scoreName.slice(formerStudentText.length)
            }
          })
          main.scores.put({ "scoreArray" : myClass.scores });
        }
        $('.clicked').attr('class', 'editable student'); //make the table cell editable again
      } // end if student

      //for editing scores
      else if ($('.clicked').is($('.score'))) {
        myClass.students.forEach(function(current, index, array){
          if (current.studentName === formerStudentText){
            current.removePoints(removeThisManyPoints);
          }
        })

        if (Number($(this).val()) >= 0) {  // if text is input, then it is NaN, which is false so we don't change pointToAdd
          pointsToAdd = Number($(this).val());
        }
         else{ // what to do if the input is not a number >= 0
          pointsToAdd = 0;
        }

        var assignmentName = formerAssignmentText;
        myClass.students.forEach(function(current, index, array){
          if (current.studentName === formerStudentText){
            current.addPoints(pointsToAdd);
          }
        })
        if ($('.clicked').is($('#' + formerStudentText + formerAssignmentText))) {
          myClass.scores.forEach(function(current, index, array){
            if (current.scoreName === $('.clicked').attr('id')) {
              current.updateScore(pointsToAdd);
              pointsToAdd  = 0;  //set pointsToAdd equal to 0 after adjusting current score in order to prevent eroneus behavior from having data stored here when it shouldn't be
            }
          })
        }
        main.scores.put({ "scoreArray" : myClass.scores });
        main.students.put({ "studentArray" : myClass.students });


        $('.clicked').attr('class', 'editable score'); //remove the clicked class
      }
      $('#editing').remove(); //remove the text input box
      renderAll();
    }
    else{
      renderAll();
    }
  }); // end on.blur
}

///////////////// Delete Data ////////////////////

function deleteObject(name, type){
  var found = false, removedPoints, objectName, placeholderID, putData, dataList;

  if (type === "student"){
    myClass.students.forEach(function(current, index, array){
      if (current.studentName === name) {
        found = true;
        myClass.students.splice(current, 1);
      }
    })
    main.students.put({  "studentArray" : myClass.students})
  } // end if student

  if (type === "assignment") {
    assigmentList.forEach(function(current, index, array){
      if (current.assignmentName === name) {
        found = true;
        myClass.assignments.splice(current, 1);


        myClass.points -= current.points;// NO! THAT ONLY WORKS IF EVERYONE HAS THE FULL POINT VALUE! NEED TO GET THIS FROM THE SCORE OBJECT INSTEAD!
        removedPoints = current.points;
        myClass.assignments.splice(current, 1);
        main.points.put({  "totalPoints" : myClass.points });
        main.assignments.put({  "assignmentArray" : myClass.assignments})

        myClass.students.forEach(function(current, index, array){ // lower every student's score by the same amount tha total points was lowered by
          current.removePoints(removedPoints);
        })
        main.students.put({  "studentArray" : myClass.students})

      }// end  if currrent.assignmentName  = name
    }) // end myClass.assignments.forEach()
  } // end if assignment
  if (!found){ // "not found", get it ? Its clever :)
    console.log("couldn't find it, so I can't delete it!")
  }
}// end deleteObject()



/////////////// Event Listeners //////////////////

$('table').on('click', '.editable',  function(){
    var storedName, storedAssignment, pointsToRemove, present = false;
    if ($(this).is('.student')) {
      storedName = $(this).text();
      storedAssignment = null;
      pointsToRemove = null;
    }
    if ($(this).is('.assignment')){
      storedName = null;
      storedAssignment = $(this).attr('id');
      pointsToRemove = null;
    }
    if ($(this).is('.score')) {
      storedName = $(this).siblings(':first').attr('id');
      storedAssignment =  $(this).attr('id').slice(storedName.length);
      pointsToRemove  = Number($(this).text()); //subract off the points in the cell FIRST so the score can be lowered to a new value if needed. If the cell is blank then that's ok because Number(emptyString) === 0
      myClass.scores.forEach(function(current, index, array){
        if (current.scoreName === storedName + storedAssignment){
          present = true;
        }
      })
      if (!present) {
        myClass.scores.push(new Score(storedName + storedAssignment));
        console.log(myClass.scores)
        main.scores.put({ "scoreArray" : myClass.scores });
      }
    }
    $(this).addClass('clicked');
    editCells(storedName, storedAssignment, pointsToRemove);
  });

$('#addStudent').on('click', function(){
    if ($('#studentName').val() === '') { //check if text input field is empty
      console.log("Nothing to add! Enter a new student name!");
    }
    else {
      new Student(properCapitalization($('#studentName').val())).addStudent();
      renderAll();
    }
  });

$('#addAssignment').on('click', function(){
  var pointValue = Number($('#pointValue').val());
  /*    /^\d+$/  this regex should mean "starting with at least one digit and continuously only having digits until the end"   (so no neatives or decimals or non-numbers)   */
  if ($('#assignmentName').val() !== '' && /^\d+$/.test(pointValue))  { //check if there is text in the input field and that the point field is actualy digits greater than 0 and it is a whole number
    new Assignment(properCapitalization($('#assignmentName').val()), pointValue).addAssignment(); //put new assignment in myClass.assignments
    renderAll();
  }
  else {
    console.log("make sure the fields are not blank and that the points value is a positive whole number")
  }
});

$('#deleteStudent').on('click', function(){
  if ($('#deleteStudentName').val() === '') { //check if there is text in the input field
  console.log("nothing to delete!");
  }
  else {
   deleteObject(properCapitalization($('#deleteStudentName').val()), "student"); // search myClass.students for the object and remove it.
   renderAll();
  }
});

$('#deleteAssignment').on('click', function(){
  if ($('#deleteAssignmentName').val() === '') { //check if there is text in the input field
  console.log("nothing to delete!");
  }
  else {
   deleteObject(properCapitalization($('#deleteAssignmentName').val()), "assignment"); // search myClass.assignments for the object and remove it.
   renderAll();
  }
});

