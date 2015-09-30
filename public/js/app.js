'use strict';
var totalPointsID = '56005b32e4b0e6c040a24d34';
var scoreArrayID = '56005b32e4b099d78856fee9';
var studentArrayID = '56005b32e4b0e6c040a24d36';
var assignmentArrayID = '56005b32e4b0e6c040a24d35';
var totalPointsPossible;
var studentList;
var assignmentList;
var scoreList;
var pointsToAdd;
var pointsToRemove;
var getCounter;

function get(mongoID){
  function checkGetCounter() {  // runs after each of the get() calls.  Must have all 4 get calls done initially in order for these functions to work properly
    if (getCounter === undefined) {
      getCounter = 1;
    }
    else {
      getCounter ++;
    }
    if (getCounter === 4){ // once all 4 get requests have received a response...
      alphabetizeStudents();
      renderStudents();
      renderAssignments();
    }
  }

  $.ajax({
    url: 'https://api.mongolab.com/api/1/databases/gradebookproject/collections/myData/' + mongoID + '?apiKey=Q_MWxLPLxfonVusuXCHtaz6boo4vCKTN',

    type: 'GET',
    contentType: 'application/json',
    dataType: 'json',
    success: function(){
      console.log('Connected to MongoDB for GET')

    }
  })
  .done(function(response){
    if (mongoID === totalPointsID) {
      totalPointsPossible = response.totalPoints;
      if (totalPointsPossible === undefined){
        totalPointsPossible = 0;
        put({"totalPoints" : totalPointsPossible }, totalPointsID);  //NOT POST because the db file is already there. It is just being updated.
      }
    }
    else if (mongoID === scoreArrayID){
      scoreList = response.scoreArray;
      if (scoreList === undefined){
        scoreList = [];
        put({"scoreArray" : scoreList }, scoreArrayID);
      }
    }
    else if (mongoID === studentArrayID){
      studentList = response.studentArray
      if (studentList === undefined){
        studentList = [];
        put({"studentArray" : studentList }, studentArrayID);
      }
      studentList.forEach(function(current, index, array){
        Object.setPrototypeOf(current, Student.prototype);
      })
    }
    else if (mongoID === assignmentArrayID){
      assignmentList = response.assignmentArray;
      if (assignmentList === undefined){
        assignmentList = [];
        put({"assignmentArray" : assignmentList }, assignmentArrayID);
      }
      assignmentList.forEach(function(current, index, array){
        Object.setPrototypeOf(current, Assignment.prototype);
      })
    }
    checkGetCounter();
  })
}// end get();

function put(theData, mongoID){
  $.ajax({
    url: 'https://api.mongolab.com/api/1/databases/gradebookproject/collections/myData/' + mongoID + '?apiKey=Q_MWxLPLxfonVusuXCHtaz6boo4vCKTN',
    data: JSON.stringify( { "$set" : theData }),
    type: "PUT",
    contentType: "application/json",
    success: console.log('Connected to MongoDB for PUT')
  });
}

function Score(scoreName, score){
  this.scoreName = scoreName;
  this.score = score;
}

function Student(studentName){
  this.studentName = studentName;
  this.totalScore = 0;
}

Student.prototype.addPoints = function(){
   this.totalScore += pointsToAdd;
}

Student.prototype.removePoints = function(){
    this.totalScore -= pointsToRemove;
}


Student.prototype.getPercentScore = function(){
 this.percentGrade = ((this.totalScore / totalPointsPossible) * 100).toFixed(2);
}

Student.prototype.getLetterGrade = function() {
  if (this.percentGrade >= 90){this.letterGrade = "A";}
  else if (this.percentGrade >= 80){this.letterGrade = "B";}
  else if (this.percentGrade >= 70){this.letterGrade = "C";}
  else if (this.percentGrade >= 60){this.letterGrade = "D";}
  else if (this.percentGrade < 60){this.letterGrade = "F";}
  else {this.letterGrade = "Houston, we have a problem.";}
}

Student.prototype.addStudent = function(){  // adds student to studentList
  var studentMatch = false;
  var storedStudentName = this.studentName;
  var storedStudentObject = this;
  studentList.forEach(function(current, index, array){
    if (current.studentName === storedStudentName) {
      console.log("we got a match for " + storedStudentName );
      studentMatch = true; //if student is already in list then change studentMatch to true
    }
  }) // end forEach
  if (!studentMatch) { // if no match, then add to list and update database
    studentList.unshift(storedStudentObject);
    put({ "studentArray" : studentList }, studentArrayID);
  }
}

function renderStudents(){
  $('tr').find('.student').parent().remove(); //remove ALL tr with student class children
  for (var i = 0; i < studentList.length; i++){
    studentList[i].getPercentScore();
    studentList[i].getLetterGrade();

    $('#table').append('<tr><td class="editable student students" id="'  + studentList[i].studentName + '">' + studentList[i].studentName + '</td> <td class="grade grades" id="letterGrade' + studentList[i].studentName+'">' + studentList[i].letterGrade + '</td> <td class ="grade grades" id="percentGrade'+ studentList[i].studentName +'">' + studentList[i].percentGrade + ' %</td></tr>');
  }
}

function properCapitalization(input){
  return input.slice(0,1).toUpperCase() + input.slice(1).toLowerCase();
} //makes 1st letter capitalized, and rest lowercase regardless of input capitalization; this will be important for alphabetizing as ASCII numbers for lowercase "a" is actually HIGHER than for uppercase "Z", and my method of comparing compares ASCII values

function Assignment(assignmentName, points){
  this.assignmentName = assignmentName;
  this.points = points;
}

Assignment.prototype.addAssignment = function(){
  var assignmentMatch = false; //first assume the new assignment is NOT in the list already
  var storedAssignmentName = this.assignmentName;
  var storedAssignmentObject = this;
  assignmentList.forEach(function(current, index, array){ //check to see if assignmet is in list
    if (current.assignmentName === storedAssignmentName) {
      console.log("we got a match for " + storedAssignmentName);
      assignmentMatch = true; // assignment was in the list
    }
  }) // end forEach
  if (!assignmentMatch) { // if no match for that assignment name, then put the assignment in the list and update points and database
    assignmentList.unshift(this);
    totalPointsPossible += this.points
    put({ "assignmentArray" : assignmentList }, assignmentArrayID);
    put({ "totalPoints" : totalPointsPossible }, totalPointsID);
    }
}

function renderAssignments(){
  var scoreYet;
  var id;
  var placeholder = '';
  $('.assignment').remove();
  for (var i = 0; i < assignmentList.length; i++){ // go through assingment list
    for (var j = 0; j < studentList.length; j++) { // for EACH assignment, go through student list and make a new TD with student-assignment id
      if (scoreList[0] !== undefined) { // if there are score objects in the score array already, then go through the k loop
        for (var k = 0; k < scoreList.length; k++){
          scoreYet = false;
          if (scoreList[k].scoreName.slice(0, -assignmentList[i].assignmentName.length) === studentList[j].studentName && scoreList[k].scoreName.slice(studentList[j].studentName.length) === assignmentList[i].assignmentName){
            if (scoreList[0]!== undefined){
              placeholder = scoreList[k].score
            }
            var nameOfStudent = studentList[j].studentName
            id = nameOfStudent + assignmentList[i].assignmentName
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
          var nameOfStudent = studentList[j].studentName
          id = nameOfStudent + assignmentList[i].assignmentName
          $('#percentGrade' + nameOfStudent).after('<td class="editable score" id="'+ id + '">'  + placeholder + '</td>'); // render an empty assignment score box with unique id for student/assignment combo (only if there wasn't a score object found to match )
      } // ok now go on to the next student and run though the k loop again
    } // end j loop  (move on to next assignemnt to render)

    $('#gradePercent').after('<th class="editable assignment" id=' + assignmentList[i].assignmentName +'>' + assignmentList[i].assignmentName + '<br><table><tr><td class="editable assignmentPoints" id="points' + assignmentList[i].assignmentName + '">' + assignmentList[i].points +' pts</td></tr></table></th>'); //put new table header  with assignemnt name after the  grade percent column
  } // end i loop
}

function editCells(formerStudentText, formerAssignmentText){
  var found = false;  // used for seing if students or assignments have been duplicated
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
        assignmentList.forEach(function(current, index, array){
          if (current.assignmentName === editValue){ //if this new edited value   WAS already in the assignment list then don't change anything! make it its original value. no duplicates!
          console.log("that was already in the list! So we're not changing anything!")
          }
        }) // end for Each

        if (found === false) {  // if it was NOT already there, then change the assignment name and list

          assignmentList.forEach(function(current, index, array){

            if (current.assignmentName === formerAssignmentText){
              assignmentList[index].assignmentName = editValue //then replace that index value with the new ones

            }
          }) //end forEach
        }
          put({ "assignmentArray" : assignmentList }, assignmentArrayID);

          scoreList.forEach(function(current, index, array){
            if (current.scoreName.slice(-(formerAssignmentText.length)) === formerAssignmentText ){  // if the first part of the scoreName matches the name of the assignment that was JUST changed (the old name not the new one), then replace the first part of scoreName with the NEW name
              current.scoreName = current.scoreName.slice(0, (current.scoreName.length - formerAssignmentText.length)) + editValue;
            }
          })
          put({ "scoreArray" : scoreList }, scoreArrayID);

        $('.clicked').removeClass('clicked'); //remove clicked class
      } // end if assignment

      // for editing student names
      else if ($('.clicked').is($('.student'))) {   // if cell is student class)
        $('.clicked').attr('id', editValue); // set id to the edited value
        studentList.forEach(function(current, index, array){
          if (current.studentName === editValue){ //if this new edited value   WAS already in the student list then don't change anything! make it its original value. no duplicates!
            console.log("that was already in the list! So we're not changing anything!")
            found = true;  // if any of them match, then the found state will be "true"
          }
        }) //end forEach

        if (found === false) {
          // if it was NOT already there, then change the student name and list by CHANGING the studentName on that object that USED TO match the clicked cell's name
          studentList.forEach(function(current, index, array){
            if (current.studentName === formerStudentText) { // find the student name that matches the old text of the clicked cell
              studentList[index].studentName = editValue; //change the matching student name to the edit value
            }
          }) // end forEach
          put({ "studentArray" : studentList }, studentArrayID);

          scoreList.forEach(function(current, index, array){
            if (current.scoreName.slice(0, formerStudentText.length) === formerStudentText ){  // if the first part of the scoreName matches the name of the student who was JUST changed (the old name not the new one), then replace the first part of scoreName with the NEW name
              current.scoreName = editValue + current.scoreName.slice(formerStudentText.length)
            }
          })
          put({ "scoreArray" : scoreList }, scoreArrayID);
        }
        $('.clicked').attr('class', 'editable student'); //make the table cell editable again
      } // end if student

      //for editing scores
      else if ($('.clicked').is($('.score'))) {
        studentList.forEach(function(current, index, array){
          if (current.studentName === formerStudentText){
            current.removePoints();
          }
        })

        if (Number($(this).val()) >= 0) {  // if text is input, then it is NaN, which is false so we don't change pointToAdd
          pointsToAdd = Number($(this).val());
        }
         else{ // what to do if the input is not a number >= 0
          pointsToAdd = 0;
        }

        var assignmentName = formerAssignmentText;
        studentList.forEach(function(current, index, array){
          if (current.studentName === formerStudentText){
            current.addPoints();
          }
        })

        if ($('.clicked').is($('#' + formerStudentText + formerAssignmentText))) {
          scoreList.forEach(function(current, index, array){
            if (current.scoreName === $('.clicked').attr('id')) {
              current.score = pointsToAdd;
              pointsToAdd  = 0;  //set pointsToAdd equal to 0 after adjusting current score in order to prevent eroneus behavior from having data stored here when it shouldn't be
            }
          })
        }
        put({ "scoreArray" : scoreList }, scoreArrayID);
        put({ "studentArray" : studentList }, studentArrayID);

        $('.clicked').attr('class', 'editable score'); //remove the clicked class
      }
      $('#editing').remove(); //remove the text input box
      alphabetizeStudents();
      renderStudents();
      renderAssignments();
    }
    else{
      renderStudents();
      renderAssignments();
    }
  }); // end on.blur
}

function deleteObject(name, type){
  var found = false;
  var objectName;
  var objectList;
  var storageArray;
  var arrayID;

  if (type === "student"){
    objectName = studentName;
    objectList = studentList;
  }
  if (type === "assignment"){
    objectName = assignmentName;
    objectList = assignmentList;
  }

  objectList.forEach(function(current, index, array){
    if (current.studentName === name || current.assignmentName === name) {
      objectList.splice(index, 1);
      put({  "studentArray" : studentList }, studentArrayID);
      put({  "assignmentArray" : assignmentList }, assignmentArrayID);
      put({  "scoreArray" : scoreList }, scoreArrayID);
      put({  "totalPoints" : totalPointsPossible }, totalPointsID);
      found = true;
    }
  })
  if (!found){  console.log("couldn't find it, so I can't delete it!")
  }
}

function alphabetizeStudents(){
  if (studentList.length > 1){
    var higherAlphabet;
    var lowerAlphabet;
    while (true){
      var changeCounter = 0;
      for (var i = 0; i < studentList.length - 1 ; i++){ // length-1 becasue we do the last comparison on the next-to-last index
        if (studentList[i+1].studentName < studentList[i].studentName){ //if 2 consecutive students are NOT in alphabetical order then...
          higherAlphabet = studentList[i];  //store the higher value
          lowerAlphabet = studentList[i+1]; //store the lower value
          studentList[i]= lowerAlphabet;  //swap the two values
          studentList[i+1] = higherAlphabet;
          changeCounter ++;
        }
      } // end for loop
      if (changeCounter === 0){
        break;
        } // at end of each iteration though the while loop, check if any changes were made to alphaetical list during that iteration. If not, then it is finally alphabetized so end loop.
    }//end while loop
  }
}//end alphabetizeStudents()

function main(){
  get(totalPointsID);
  get(studentArrayID);
  get(assignmentArrayID);
  get(scoreArrayID);

  $('#addStudent').on('click', function(){
    if ($('#studentName').val() === '') { //check if text input field is empty
      console.log("Nothing to add! Enter a new student name!");
    }
    else {
      var newStudent = new Student(properCapitalization($('#studentName').val()));
      newStudent.addStudent();
      alphabetizeStudents();
      renderStudents();
      renderAssignments();
    }
  });

  $('#addAssignment').on('click', function(){
    if ($('#assignmentName').val() === '') { //check if there is text in the input field
    console.log("nothing to add!")
    }
    else {
      var pointValue = Number($('#pointValue').val());
      var newAssignment = new Assignment(properCapitalization($('#assignmentName').val()), pointValue);
      newAssignment.addAssignment();
      renderStudents();
      renderAssignments();
    }
  });

  $('#deleteStudent').on('click', function(){
    if ($('#deleteStudentName').val() === '') { //check if there is text in the input field
    console.log("nothing to delete!");
    }
    else {
     deleteObject(properCapitalization($('#deleteStudentName').val()), "student"); // search studentList for the object and remove it.
     renderStudents();
     renderAssignments();
    }
  });

  $('#deleteAssignment').on('click', function(){
    if ($('#deleteAssignmentName').val() === '') { //check if there is text in the input field
    console.log("nothing to delete!");
    }
    else {
     deleteObject(properCapitalization($('#deleteAssignmentName').val()), "assignment"); // search assignmentList for the object and remove it.
     renderStudents();
     renderAssignments();
    }
  });

  $('table').on('click', '.editable',  function(){
    var storedAssignment;
    var storedName;
    if ($(this).is('.student')) {
      console.log("STUDENT!")
      storedName = $(this).text();
      storedAssignment = null;
    }
    if ($(this).is('.assignment')){
      console.log("ASSIGNMENT!")
      storedName = null;
      storedAssignment = $(this).attr('id');
    }
    if ($(this).is('.score')) {
      storedName = $(this).siblings(':first').attr('id');
      storedAssignment =  $(this).attr('id').slice(storedName.length);
      if (Number($(this).text()) !== NaN){
        pointsToRemove  = Number($(this).text());  //subract off the points in the cell FIRST so the score can be lowered to a new value if needed. otherwise it just gets bigger every time
      }
      else{
        pointsToRemove = 0;
      }
      var newScore = new Score(storedName + storedAssignment , 0);
      scoreList.push(newScore);
      put({ "scoreArray" : scoreList }, scoreArrayID);
    }
    $(this).addClass('clicked');
    editCells(storedName, storedAssignment);
  });
} //end main()

main(); //start the program
