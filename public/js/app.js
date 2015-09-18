'use strict';

console.log('app.js file is being read');
var formerValue;
var assignmentList = [];
var studentList = [];
var scoreList = [];
var totalPointsPossible = 0;
var pointsToAdd = 0;
var pointsToRemove = 0;
var storedName;
var storedAssignment;
var scoreYet;

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
 this.percentGrade = ((this.totalScore / totalPointsPossible) * 100) // display this using.toString() + "%" but keep it as a number here for  getting letter grade
}


Student.prototype.getLetterGrade = function() {
  if (this.percentGrade >= 90){this.letterGrade = "A";}
  else if (this.percentGrade >= 80){this.letterGrade = "B";}
  else if (this.percentGrade >= 70){this.letterGrade = "C";}
  else if (this.percentGrade >= 60){this.letterGrade = "D";}
  else if (this.percentGrade < 60){this.letterGrade = "F";}
  else {this.letterGrade = "Houston, we have a problem.";}

}

Student.prototype.addStudent = function(){
  if (studentList[0] === undefined){ //if list is empty
    studentList.unshift(this);
    console.log(studentList)
  }
  else { // otherwise the list has students. do the following:
    var storedStudentName = this.studentName;
    var storedStudentObject = this;
    var studentMatch = false;
    studentList.forEach(function(current, index, array){
      if (current.studentName === storedStudentName) { //if student is already in list then change studentMatch to true
        console.log("we got a match");
        studentMatch = true;
      }
    }) // end forEach
    if (!studentMatch) { // if no match for that student name, then put the student in the list
    studentList.unshift(storedStudentObject);
    console.log(studentList);
      }
  }
}

function renderStudents(){
  $('tr').find('.student').parent().remove(); //this will remove ALL tr with student class children
  for (var i =0; i < studentList.length; i++){
    var table = document.getElementById('table');
    var newRow = document.createElement('tr');
    table.appendChild(newRow);
    // studentList[i].removePoints();
    // studentList[i].addPoints();
    studentList[i].getPercentScore();
    studentList[i].getLetterGrade();
    newRow.innerHTML = '<td class="editable student" id="'  + studentList[i].studentName + '">' + studentList[i].studentName + '</td> <td id="letterGrade' + studentList[i].studentName+'">' + studentList[i].letterGrade + '</td> <td id="percentGrade'+ studentList[i].studentName +'">' + studentList[i].percentGrade + '</td>';
  }
}

$('#addStudent').on('click', function(){
    if ($('#studentName').val() === '') { //check if text input field is empty
      console.log("nothing to add!");
    }
    else {
      var originalInput = $('#studentName').val() //value of the input field text
      var properCapitalization = originalInput.slice(0,1).toUpperCase() + originalInput.slice(1).toLowerCase(); //makes 1st letter capitalized, and rest lowercase regardless of input capitalization; this will be important for alphabetizing as ASCII numbers for lowercase "a" is actually HIGHER than for uppercase "Z", and my method of comparing compares ASCII values


      var newStudent = new Student(properCapitalization);
      newStudent.addStudent();
      // console.log(studentList[0].studentName)
      alphabetizeStudents();// alphabetize list of students (in case changes were made to student names)
      renderStudents();
      renderAssignments();
   }
});

function Assignment(assignmentName, points, score){
  this.assignmentName = assignmentName;
  this.points = points;
  // this.score = score;
}

Assignment.prototype.addAssignment = function(){
  if (assignmentList[0] === undefined){ //if list is empty
    assignmentList.unshift(this);
    totalPointsPossible += this.points
    console.log(assignmentList)
  }
  else { // otherwise the list has students. do the following:
    var storedAssignmentName = this.assignmentName;
    var storedAssignmentObject = this;
    var assignmentMatch = false;
    assignmentList.forEach(function(current, index, array){
      if (current.assignmentName === storedAssignmentName) { //if student is already in list then change studentMatch to true
        console.log("we got a match");
        assignmentMatch = true;
      }
    }) // end forEach
    if (!assignmentMatch) { // if no match for that student name, then put the student in the list
    assignmentList.unshift(storedAssignmentObject);
    totalPointsPossible += this.points;
    console.log(assignmentList);
      }
  }
}


function renderAssignments(){
  var id;
  var placeholder = '';
  $('.assignment').remove();
  for (var i = 0; i < assignmentList.length; i++){ // go through assingment list
    for (var j = 0; j < studentList.length; j++) { // for EACH assignment, go through student list and make a new TD with student-assignment id
      if (scoreList[0] !== undefined) { // it there are score objects in the score array already, then go through the k loop
        for (var k = 0; k < scoreList.length; k++){
          scoreYet = false;
          if (scoreList[k].scoreName.slice(0, -assignmentList[i].assignmentName.length) === studentList[j].studentName && scoreList[k].scoreName.slice(studentList[j].studentName.length) === assignmentList[i].assignmentName){

            console.log("OK RENDERING" , scoreList[k] )
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
        console.log("OK LET'S PUT A BLANK ONE IN!");

          placeholder = '';

          var nameOfStudent = studentList[j].studentName
          id = nameOfStudent + assignmentList[i].assignmentName
          $('#percentGrade' + nameOfStudent).after('<td class="editable score" id="'+ id + '">'  + placeholder + '</td>'); // render an empty assignment score box with unique id for student/assignment combo (only if there wasn't a score object found to match )

      } // ok now go on to the next student and run though the k loop again

    } // end j loop  (move on to next assignemnt to render)


    $('#gradePercent').after('<th class="editable assignment" id=' + assignmentList[i].assignmentName +'>' + assignmentList[i].assignmentName + '<br><table><tr><td>' + assignmentList[i].points +' pts</td></tr></table></th>'); //put put new table header  with assignemnt name after the  grade percent column (newest assignment to the left, older ones pushed to the right)
  } // end i loop
}



$('#addAssignment').on('click', function(){
  if ($('#assignmentName').val() === '') { //check if there is text in the input field
  console.log("nothing to add!")
  }
  else {
    var originalInput = $('#assignmentName').val()
    var properCapitalization = originalInput.slice(0,1).toUpperCase() + originalInput.slice(1).toLowerCase(); //makes 1st letter capitalized, and rest lowercase regardless of input capitalization; this will be important for alphabetizing as ASCII numbers for lowercase "a" is actually HIGHER than for uppercase "Z", and my method of comparing compares ASCII values
    var pointValue = Number($('#pointValue').val());
    var newAssignment = new Assignment(properCapitalization, pointValue, 0);
    newAssignment.addAssignment();
    renderStudents();
    renderAssignments();
  }
});


function editCells(formerText, assignmentText){
  var found = false;  // used for seing if students or assignments have been duplicated
  console.log("formerValue: " + formerText);
  $('.clicked').text(''); // clear the old text
  $('<input>').attr({ type: 'text', id: 'editing'}).appendTo('.clicked'); // insert a text input box
  $('#editing').focus(); //put focus on the new text input box

  $('#editing').on('blur', function(){
    var originalInput = $('#editing').val()
    var editValue = originalInput.slice(0,1).toUpperCase() + originalInput.slice(1).toLowerCase();

    $('.clicked').text(editValue); //set new table cell text

    //for editing assignments:
    if ($('.clicked').is($('.assignment'))) {   // if cell is assignment class f)
      console.log("ASSIGNMENT!!!");

      $('.clicked').attr('id', editValue); // set id to the edited value
      assignmentList.forEach(function(current, index, array){
        if (current.assignmentName === editValue){ //if this new edited value   WAS already in the assignment list then don't change anything! make it its original value. no duplicates!
        console.log("that was already in the list! So we're not changing anything!")
        $('.clicked').text(formerValue);  // keep the text the same as it was before
        $('.clicked').attr('id', formerText); //keep id same as before
        found = true;
        }
        if (found === false) {  // if it was NOT already there, then change the assignment name and list
          assignmentList[index].assignmentName = editValue//then replace that index value with the new ones
          console.log("assignment list is now: ");
          console.log(assignmentList);
        }
      }) //end forEach

      $('.clicked').attr('class', 'editable assignment'); //make the table cell editable again
    } // end if assignment

    // for editing student names
    else if ($('.clicked').is($('.student'))) {   // if cell is student class)
      console.log('STUDENT!!!!');

      $('.clicked').attr('id', editValue); // set id to the edited value

      studentList.forEach(function(current, index, array){
        if (current.studentName === editValue){ //if this new edited value   WAS already in the student list then don't change anything! make it its original value. no duplicates!
          console.log("that was already in the list! So we're not changing anything!")
          $('.clicked').text(formerText);  // keep the text the same as it was before
          $('.clicked').attr('id', formerText); //keep id same as before
          found = true;
        }
      }) //end forEach

      if (found === false) {
        console.log("ok new name!")
        // if it was NOT already there, then change the student name and list by CHANGING the studentName on that object that USED TO match the clicked cell's name
        studentList.forEach(function(current, index, array){
          if (current.studentName === formerText) { // find the student name that matches the old text of the clicked cell
            studentList[index].studentName = editValue; //change the matching student name to the edit value
          }
        }) // end forEach

        // studentList[studentList.indexOf(formerText)].studentName = editValue//then replace that index value with the new ones
        console.log("studentlist is now: ");
        console.log(studentList);
      }
      $('.clicked').attr('class', 'editable student'); //make the table cell editable again
    } // end if student

    //for editing scores
    else if ($('.clicked').is($('.score'))) {
      console.log("SCORE!!!");
      console.log("points to remove: " + pointsToRemove);
      studentList.forEach(function(current, index, array){
        if (current.studentName === formerText){
          current.removePoints();
        }
      })


      if (Number($(this).val()) >= 0) {  // if text is input, then it is NaN, which is false so we don't change pointToAdd
        pointsToAdd = Number($(this).val());
      }
      console.log("points to add: " + pointsToAdd);
      var assignmentName = assignmentText;

      studentList.forEach(function(current, index, array){
        if (current.studentName === formerText){
          current.addPoints();
        }

      })

      if ($('.clicked').is($('#' + formerText + assignmentText))) {
        console.log("OK!!!!!!!!!!!!!!!!!!")
        scoreList.forEach(function(current, index, array){
          console.log($('.clicked').attr('id'))
          if (current.scoreName === $('.clicked').attr('id')) {
            current.score = pointsToAdd;
          }

        })
      }

      $('.clicked').attr('class', 'editable score'); //remove the clicked class
    }
    $('#editing').remove(); //remove the text input box
    alphabetizeStudents();  // alphabetize list of students (in case changes were made to student names)
    renderStudents();
    renderAssignments();
  }); // end on.blur
}



$('table').on('click', '.editable',  function(){
  if ($(this).is('.student')) {
    console.log("STUDENT!")
    storedName = $(this).text();
  }
  else if ($(this).is('.assignment')){
    console.log("ASSIGNMENT!")
    storedName = $(this).attr('id');
  }
  else if ($(this).is('.score')) {
  console.log("SCORE!");
  storedName = $(this).siblings(':first').attr('id');
  storedAssignment =  $(this).attr('id').slice(storedName.length);
  console.log("stored assignment: " + storedAssignment)
  pointsToRemove  = Number($(this).text());  //subract off the points in the cell FIRST so the score can be lowered to a new value if needed. otherwise it just gets bigger every time
  var newScore = new Score(storedName + storedAssignment , 0);
  scoreList.push(newScore);
  }
  else {
    console.log("neither assignment nor student nor score")
  }
  console.log("stored name: " + storedName)
  $(this).addClass('clicked');
  editCells(storedName, storedAssignment);
});


function deleteStudent(studentName){
  var found = false;
  studentList.forEach(function(current, index, array){
    if (current.studentName === studentName) {
      console.log("it was in the list already. Let's delete it!");
      studentList.splice(index, 1);
      found = true;
      }
  })
  if (found === false){
    console.log("couldn't find it, so I can't delete it!")
  }
}

$('#deleteStudent').on('click', function(){
  if ($('#deleteStudentName').val() === '') { //check if there is text in the input field
  console.log("nothing to delete!");
  }
  else {
  var originalInput = $('#deleteStudentName').val()
  var properCapitalization = originalInput.slice(0,1).toUpperCase() + originalInput.slice(1).toLowerCase();
   deleteStudent(properCapitalization); // search assignmentList for the object and remove it.
   renderStudents();
   renderAssignments();
  }
});

function deleteAssignment(assignmentName){
  console.log(assignmentList)
  var found = false;
  assignmentList.forEach(function(current, index, array){
    if (current.assignmentName === assignmentName) {
      console.log("it was in the list already. Let's delete it!");
      console.log(assignmentList)
      var spliced = assignmentList.splice(index, 1);
      found = true;
    }
    else {
      found = false}
  })
  if (found === false){
    console.log("couldn't find it, so I can't delete it!")
  }
}


$('#deleteAssignment').on('click', function(){
  if ($('#deleteAssignmentName').val() === '') { //check if there is text in the input field
  console.log("nothing to delete!");
} else {
  var originalInput = $('#deleteAssignmentName').val()
  var properCapitalization = originalInput.slice(0,1).toUpperCase() + originalInput.slice(1).toLowerCase();
  console.log("deleting: " + properCapitalization)
   deleteAssignment(properCapitalization); // search assignmentList for the object and remove it.
   renderStudents();
   renderAssignments();
  }
});


function alphabetizeStudents(){
  /*
  the for loop always alphabetizes in one go when new students are addd because we start with one item then 2. The array is ALWAYS alphabetized before adding a new student, and becuause the student is beign added to the FRONT of the list (unshift), it always works.
  ****** HOWEVER, when changing names, the student would only be shifted by ONE cell up (but will go down as many as needed). so for students going UP (i.e to an earlier place in the alphabetized list) if that needs to be more than one cell up, then a loop is needed, and must be iterated through for each cell that the student shifts up.

  Otherwise this would need a while loop to keep iterating over and over until it is order. Then a check to see if any changes were made on the last iteration. If not, end the loop.
  */
  var higherAlphabet; //declared in the lexical scope of this function so it cannot be tampered with accidentally (as it could if it was in the global scope) and mess up the  alphabetizing
  var lowerAlphabet;
  while (true){
    var changeCounter = 0;
    for (var i = 0; i < studentList.length - 1 ; i++){ // length-1 becasue we do the last comparison on the next-to-last index
      if (studentList[i+1].studentName < studentList[i].studentName){ //if 2 consecutive students are NOT in alphabetical order then...
        higherAlphabet = studentList[i].studentName;  //store the higher value
        lowerAlphabet = studentList[i+1].studentName; //store the higher value
        studentList[i].studentName = lowerAlphabet;  //swap the two values
        studentList[i+1].studentName = higherAlphabet;
        changeCounter ++;
      }
    } // end for loop
    if (changeCounter === 0){
      break;
      }
  }//end while loop
}//end alphabetizeStudents()
