 'use strict';
const TOTAL_POINTS_ID = '56005b32e4b0e6c040a24d34';
const SCORE_ARRAY_ID = '56005b32e4b099d78856fee9';
const STUDENT_ARRAY_ID = '56005b32e4b0e6c040a24d36';
const ASSIGNMENT_ARRAY_ID = '56005b32e4b0e6c040a24d35';

var main = (function mainIIFE(){

  var totalPointsPossible;
  var studentList;
  var assignmentList;
  var scoreList;
  var getCounter; // needs to be global so checkGetCounter() adds to the same instance of the variable each time, not a unique one  that is initialized each time the function is called

  function renderAll(){
    alphabetizeStudents();
    renderStudents();
    renderAssignments();
  }

  function checkGetCounter() {
   // runs after each of the get() calls.  Must have all 4 get calls done initially in order for these functions to work properly
    if (getCounter === undefined) {
      getCounter = 1;
    }
    else {
      getCounter ++;
    }
    if (getCounter === 4){ // once all 4 get requests have received a response...
      return renderAll();
    }
  }

  function get(mongoID){
    var myObject, putPlaceholder, objectList;
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
      if (mongoID === TOTAL_POINTS_ID) {
        myObject = null // so we don't use forEach
        totalPointsPossible = response.totalPoints;
        if (totalPointsPossible === undefined){
          totalPointsPossible = 0;
          putPlaceholder = {"totalPoints" : totalPointsPossible };
          objectList = []; // only needed to trigger the put() call later
        }
        else {
          objectList = [totalPointsPossible] // just filler so we don't send a PUT request every time  (otherwise would not have the else block and would just have objectList = [] in the main if block)
        }
      }
      if (mongoID === SCORE_ARRAY_ID){
        scoreList = response.scoreArray;
        myObject = Score;
        if (scoreList === undefined){
          scoreList = [];
          putPlaceholder = {"scoreArray" : scoreList };
        }
        objectList = scoreList;
      }
      if (mongoID === STUDENT_ARRAY_ID){
        studentList = response.studentArray
        myObject = Student;
        if (studentList === undefined){
          studentList = [];
          putPlaceholder = {"studentArray" : studentList };
        }
        objectList = studentList;
      }
      if (mongoID === ASSIGNMENT_ARRAY_ID){
        assignmentList = response.assignmentArray;
        myObject = Assignment;
        if (assignmentList === undefined){
          assignmentList = [];
          putPlaceholder = {  "assignmentArray" : assignmentList };
        }
        objectList = assignmentList;
      }
          /********  REUSE THIS FOR EACH GET******/
      if (objectList[0] === undefined){
        put(putPlaceholder, mongoID);
      }
      if (myObject !== null){
        console.log("object list", objectList)
        objectList.forEach(function(current, index, array){
          Object.setPrototypeOf(current, myObject.prototype);
        })
      }
      return checkGetCounter();
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
    this.score = score || 0;
  }

  function Student(studentName, score){
    this.studentName = studentName;
    this.totalScore = score || 0;
  }

  function Assignment(assignmentName, points){
    this.assignmentName = assignmentName;
    this.points = points;
  }

  (function(){ // add methods to Student.prototype
    this.addPoints = function(points){
       return this.totalScore += points || 0; // add no points if not specified

    }

    this.removePoints = function(points){
       return this.totalScore -= points || 0; //add no points if not specified
    }

    this.getPercentScore = function(){
      this.percentGrade = ((this.totalScore / totalPointsPossible) * 100).toFixed(2);
      if (totalPointsPossible === 0) {
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

    this.addStudent = function(){  // adds student to studentList
      var studentMatch = false;
      var storedStudentName = this.studentName;
      studentList.forEach(function(current, index, array){
        if (current.studentName === storedStudentName) {
          console.log("we got a match for " + storedStudentName );
          studentMatch = true; //if student is already in list then change studentMatch to true
        }
      }) // end forEach
      if (!studentMatch) { // if no match, then add to list and update database
        studentList.unshift(this);
        put({ "studentArray" : studentList }, STUDENT_ARRAY_ID);
      }
    }
  }).call(Student.prototype);

  Score.prototype.updateScore = function(scoreValue){
    return this.score = scoreValue;
  }

  Assignment.prototype.addAssignment = function(){
    var assignmentMatch = false; //first assume the new assignment is NOT in the list already
    var storedAssignmentName = this.assignmentName;
    assignmentList.forEach(function(current, index, array){ //check to see if assignmet is in list
      if (current.assignmentName === storedAssignmentName) {
        console.log("we got a match for " + storedAssignmentName);
        assignmentMatch = true; // assignment was in the list
      }
    }) // end forEach
    if (!assignmentMatch) { // if no match for that assignment name, then put the assignment in the list and update points and database
      assignmentList.unshift(this);
      console.dir(assignmentList)
      totalPointsPossible += this.points
      put({ "assignmentArray" : assignmentList }, ASSIGNMENT_ARRAY_ID);
      put({ "totalPoints" : totalPointsPossible }, TOTAL_POINTS_ID);
      }
  };


  function properCapitalization(input){
    var re = /(\b[a-z](?!\s))/g; // finds first letter of words, after dashes, and punctuation so that they can be capitalized
    var noSpace = input.replace(/\s/g, "-" ) //replaces whitespace with dash
    return noSpace.replace(re, function(x){console.log("BLAAAAAAAH",x); return x.toUpperCase();});

    // return noSpace.slice(0,1).toUpperCase() + noSpace.slice(1).toLowerCase();
  } //makes 1st letter capitalized, and rest lowercase regardless of input capitalization; this will be important for alphabetizing as ASCII numbers for lowercase "a" is actually HIGHER than for uppercase "Z", and my method of comparing compares ASCII values

  function renderStudents(){
    $('tr').find('.student').parent().remove(); //remove ALL tr with student class children
    for (var i = 0; i < studentList.length; i++){
      studentList[i].getPercentScore();
      studentList[i].getLetterGrade();

      $('#table').append('<tr><td class="editable student students" id="'  + studentList[i].studentName + '">' + studentList[i].studentName + '</td> <td class="grade grades" id="letterGrade' + studentList[i].studentName+'">' + studentList[i].letterGrade + '</td> <td class ="grade grades" id="percentGrade'+ studentList[i].studentName +'">' + studentList[i].percentGrade + ' %</td></tr>');
    }
  }

  function renderAssignments(){
    var scoreYet, id, nameOfStudent, placeholder, i, j, k;
    $('.assignment').remove();
    for (i = 0; i < assignmentList.length; i++){ // go through assingment list
      for (j = 0; j < studentList.length; j++) { // for EACH assignment, go through student list and make a new TD with student-assignment id
        if (scoreList[0] !== undefined) { // if there are score objects in the score array already, then go through the k loop
          for (k = 0; k < scoreList.length; k++){
            scoreYet = false;
            if (scoreList[k].scoreName.slice(0, -assignmentList[i].assignmentName.length) === studentList[j].studentName && scoreList[k].scoreName.slice(studentList[j].studentName.length) === assignmentList[i].assignmentName){
              if (scoreList[0]!== undefined){
                placeholder = scoreList[k].score
              }
              nameOfStudent = studentList[j].studentName
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
            nameOfStudent = studentList[j].studentName
            id = nameOfStudent + assignmentList[i].assignmentName
            $('#percentGrade' + nameOfStudent).after('<td class="editable score" id="'+ id + '">'  + placeholder + '</td>'); // render an empty assignment score box with unique id for student/assignment combo (only if there wasn't a score object found to match )
        } // ok now go on to the next student and run though the k loop again
      } // end j loop  (move on to next assignemnt to render)

      $('#gradePercent').after('<th class="editable assignment" id=' + assignmentList[i].assignmentName +'>' + assignmentList[i].assignmentName + '<br><table><tr><td class="editable assignmentPoints" id="points' + assignmentList[i].assignmentName + '">' + assignmentList[i].points +' pts</td></tr></table></th>'); //put new table header  with assignemnt name after the  grade percent column
    } // end i loop
  }

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
            put({ "assignmentArray" : assignmentList }, ASSIGNMENT_ARRAY_ID);

            scoreList.forEach(function(current, index, array){
              if (current.scoreName.slice(-(formerAssignmentText.length)) === formerAssignmentText ){  // if the first part of the scoreName matches the name of the assignment that was JUST changed (the old name not the new one), then replace the first part of scoreName with the NEW name
                current.scoreName = current.scoreName.slice(0, (current.scoreName.length - formerAssignmentText.length)) + editValue;
              }
            })
            put({ "scoreArray" : scoreList }, SCORE_ARRAY_ID);

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
            put({ "studentArray" : studentList }, STUDENT_ARRAY_ID);

            scoreList.forEach(function(current, index, array){
              if (current.scoreName.slice(0, formerStudentText.length) === formerStudentText ){  // if the first part of the scoreName matches the name of the student who was JUST changed (the old name not the new one), then replace the first part of scoreName with the NEW name
                current.scoreName = editValue + current.scoreName.slice(formerStudentText.length)
              }
            })
            put({ "scoreArray" : scoreList }, SCORE_ARRAY_ID);
          }
          $('.clicked').attr('class', 'editable student'); //make the table cell editable again
        } // end if student

        //for editing scores
        else if ($('.clicked').is($('.score'))) {
          studentList.forEach(function(current, index, array){
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
          studentList.forEach(function(current, index, array){
            if (current.studentName === formerStudentText){
              current.addPoints(pointsToAdd);
            }
          })
          if ($('.clicked').is($('#' + formerStudentText + formerAssignmentText))) {
            scoreList.forEach(function(current, index, array){
              if (current.scoreName === $('.clicked').attr('id')) {
                current.updateScore(pointsToAdd);
                pointsToAdd  = 0;  //set pointsToAdd equal to 0 after adjusting current score in order to prevent eroneus behavior from having data stored here when it shouldn't be
              }
            })
          }
          put({ "scoreArray" : scoreList }, SCORE_ARRAY_ID);
          put({ "studentArray" : studentList }, STUDENT_ARRAY_ID);


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

  function deleteObject(name, type){
    var found = false, removedPoints, objectName, placeholderID, putData, dataList;

    if (type === "student"){
      objectName = studentName;
      dataList = studentList;
      putData = {  "studentArray" : studentList };
      placeholderID = STUDENT_ARRAY_ID;
    }
    if (type === "assignment"){
      objectName = assignmentName;
      dataList = assignmentList;
      putData = {  "assignmentArray" : assignmentList };
      placeholderID = ASSIGNMENT_ARRAY_ID;
    }

    dataList.forEach(function(current, index, array){
      if (current.studentName === name || current.assignmentName === name) {
        if (type === "assignment") {
          totalPointsPossible -= current.points;// NO! THAT ONLY WORKS IF EVERYONE HAS THE FULL POINT VALUE! NEED TO GET THIS FROM THE SCORE OBJECT INSTEAD!
          removedPoints = current.points;
          put({  "totalPoints" : totalPointsPossible }, TOTAL_POINTS_ID);

          // scoreList.forEach(function(current, index, array){
          //   if (/[]/.test(current.scoreName){ //WANT A REGEX HERE THAT MTACHES EITHER STUDENAME OR SCORENAME... BUT CAN I INSERT THIS WITH CONCATENATION?? / + VARIABLE + / ???
          //     scoreList.splice(index,1);
          //   }
          // })
          //NOW GO THROUGH SCORELIST AND REMOVE ANY SCORES THAT MATCH THIS ASSIGNMENT... ALSO DO THIS WHEN ASSIGNMENTS ARE RENAMED!

          studentList.forEach(function(current, index, array){ // lower every student's score by the same amount tha total points was lowered by
            current.removePoints(removedPoints);
          })

          // put({  "scoreArray" : scoreList }, SCORE_ARRAY_ID);
        }
        if (type === "student") {
          // NOW GO THROUGH SCORE LIST AND REMOVE SCORES THAT MATCH THIS STUDENT NAME... ALSO DO THIS WHEN STUDENT NAMES ARE RENAMED!

           // put({  "scoreArray" : scoreList }, SCORE_ARRAY_ID);
        }
        dataList.splice(index, 1);
        found = true;
        put(putData, placeholderID);
      }
    })
    if (!found){ // "not found", get it ? Its clever :)
      console.log("couldn't find it, so I can't delete it!")
    }
  }

  function alphabetizeStudents(){
    var i, changeCounter;
    if (studentList.length > 1){
      while (true){
        changeCounter = 0;
        for (i = 0; i < studentList.length - 1 ; i++){ // length-1 becasue we do the last comparison on the next-to-last index
          if (studentList[i+1].studentName < studentList[i].studentName){ //if 2 consecutive students are NOT in alphabetical order then...
            let higherAlphabet = studentList[i];  //store the higher value
            let lowerAlphabet = studentList[i+1]; //store the lower value
            studentList[i] = lowerAlphabet;  //swap the two values
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
        scoreList.forEach(function(current, index, array){
          if (current.scoreName === storedName + storedAssignment){
            present = true;
          }
        })
        if (!present) {
          scoreList.push(new Score(storedName + storedAssignment));
          console.log(scoreList)
          put({ "scoreArray" : scoreList }, SCORE_ARRAY_ID);
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
        new Assignment(properCapitalization($('#assignmentName').val()), pointValue).addAssignment(); //put new assignment in assignmentList
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
       deleteObject(properCapitalization($('#deleteStudentName').val()), "student"); // search studentList for the object and remove it.
       renderAll();
      }
    });

    $('#deleteAssignment').on('click', function(){
      if ($('#deleteAssignmentName').val() === '') { //check if there is text in the input field
      console.log("nothing to delete!");
      }
      else {
       deleteObject(properCapitalization($('#deleteAssignmentName').val()), "assignment"); // search assignmentList for the object and remove it.
       renderAll();
      }
    });

  return {
    get: get
  }

})(); // end of main IIFE

main.get(TOTAL_POINTS_ID);
main.get(STUDENT_ARRAY_ID);
main.get(ASSIGNMENT_ARRAY_ID);
main.get(SCORE_ARRAY_ID);

// !function main(){
  // get(TOTAL_POINTS_ID);
  // get(STUDENT_ARRAY_ID);
  // get(ASSIGNMENT_ARRAY_ID);
  // get(SCORE_ARRAY_ID);
// }();
