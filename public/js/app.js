'use strict';

console.log('app.js file is being read');
var formerValue;
var assignmentList = [];
var studentList = [];
var totalPointsPossible = 0; // start at zero, increase when assignments added
var pointsToAdd = 0;
var pointsToRemove = 0;
var pointsToDisplay = 0;
var storedName;

function Student(studentName){
  this.studentName = studentName;
  this.totalScore = 0;
}

Student.prototype.getTotalScore = function(){
   this.totalScore += pointsToAdd;
}

Student.prototype.removePoints = function(){
   if (pointsToRemove !== NaN){
    this.totalScore -= pointsToRemove;
  }
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
    var studentMatchCounter = 0;
    studentList.forEach(function(current, index, array){
      if (current.studentName === storedStudentName) { //if student is already in list then increase studentMatchCounter. otherwise do nothing.
        console.log("we got a match");
        studentMatchCounter ++;
      }
    }) // end forEach
    if (studentMatchCounter === 0) {// studentMatchCounter is still zero (student not in list) then add student to list
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
  studentList[i].getTotalScore();
  studentList[i].getPercentScore();
  studentList[i].getLetterGrade();
  newRow.innerHTML = '<td class="editable student" id="'  + studentList[i].studentName + '">' + studentList[i].studentName + '</td> <td id="letterGrade' + studentList[i].studentName+'">' + studentList[i].letterGrade + '</td> <td id="percentGrade'+ studentList[i].studentName +'">' + studentList[i].percentGrade+ '</td>';
  }
}

$('#addStudent').on('click', function(){
    if ($('#studentName').val() === '') { //check if text input field is empty
      console.log("nothing to add!");
    }
    else {
      var originalInput = $('#studentName').val() //value of the input field text
      var properCapitalization = originalInput.slice(0,1).toUpperCase() + originalInput.slice(1).toLowerCase(); //makes 1st letter capitalized, and rest lowercase regardless of input capitalization; this will be important for alphabetizing as ASCII numbers for lowercase "a" is actually HIGHER than for uppercase "Z", and my method of comparing compares ASCII values

      // if (studentList[0].studentName === properCapitalization) { //if the proper capitalization is NOT found studentList
      var newStudent = new Student(properCapitalization);
      newStudent.addStudent();
      // console.log(studentList[0].studentName)
      alphabetizeStudents();// alphabetize list of students (in case changes were made to student names)
      renderStudents();
      renderAssignments();
      // }
      // else {
        // console.log("That student already exists! No, you CAN'T make a clone!")
      // }

   }
});

function Assignment(assignmentName, points){
  this.assignmentName = assignmentName;
  this.points = points;
}


Assignment.prototype.addAssignment = function(assignmentName){
  if (assignmentList.indexOf(this) === -1){ //if the assignment is NOT already in the list then....
    assignmentList.unshift(this); //put new assignment name in the front of assignmentList array  (reverse order because the assignment cells will show most recent to the left and oldest to the right)
    totalPointsPossible += this.points;
  }
  else {console.log('was in already... doin nothing')}
  console.log(assignmentList)
}

function renderAssignments(){
  var id;
  $('.assignment').remove();
  for (var i = 0; i < assignmentList.length; i++){ // go through assingment list
    for (var j = 0; j < studentList.length; j++) { // for EACH assignment, go through student list and make a new TD with student-assignment id
     var nameOfStudent = studentList[j].studentName
      id = nameOfStudent + assignmentList[i].assignmentName
      $('#percentGrade' + nameOfStudent).after('<td class="editable score" id="'+ id + '">' + pointsToDisplay +  '</td>'); // render assignment score box with unique id for student/assignment combo
    }

    $('#gradePercent').after('<th class="editable assignment" id=' + assignmentList[i].assignmentName +'>' + assignmentList[i].assignmentName + '<br><table><tr><td>' + assignmentList[i].points +' pts</td></tr></table></th>'); //put put new table header  with assignemnt name after the  grade percent column (newest assignment to the left, older ones pushed to the right)
  }
}



$('#addAssignment').on('click', function(){
  if ($('#assignmentName').val() === '') { //check if there is text in the input field
  console.log("nothing to add!")
  }
  else {
    var originalInput = $('#assignmentName').val()
    var properCapitalization = originalInput.slice(0,1).toUpperCase() + originalInput.slice(1).toLowerCase(); //makes 1st letter capitalized, and rest lowercase regardless of input capitalization; this will be important for alphabetizing as ASCII numbers for lowercase "a" is actually HIGHER than for uppercase "Z", and my method of comparing compares ASCII values
    var pointValue = Number($('#pointValue').val());
    var newAssignment = new Assignment(properCapitalization, pointValue);
    newAssignment.addAssignment();
    renderStudents();
    renderAssignments();
  }
});


function editCells(formerText){
  var notFound = true;  // used for seing if students have been duplicated
  console.log("formerValue: " + formerText);
  $('.clicked').text(''); // clear the old text
  $('<input>').attr({ type: 'text', id: 'editing'}).appendTo('.clicked'); // insert a text input box
  $('#editing').focus(); //put focus on the new text input box

  $('#editing').on('blur', function(){
    var editValue =  $('#editing').val()
    $('.clicked').text(editValue); //set new table cell text

    //for editing assignments:
    if ($('.clicked').is($('.assignment'))) {   // if cell is assignment class f)
      console.log("ASSIGNMENT!!!");
      $('.clicked').attr('id', editValue); // set id to the edited value

      if (assignmentList.indexOf(editValue) !== -1){ //if this new edited value   WAS already in the assignment list then don't change anything! make it its original value. no duplicates!
        console.log("that was already in the list! So we're not changing anything!")
        $('.clicked').text(formerValue);  // keep the text the same as it was before
        $('.clicked').attr('id', formerText); //keep id same as before
      }
      else {  // if it was NOT already there, then change the assignment name and list
        assignmentList[assignmentList.indexOf(formerText)] = editValue//then replace that index value with the new ones
        console.log("assignment list is now: " + assignmentList);
      }
      $('.clicked').attr('class', 'editable assignment'); //make the table cell editable again
    } // end if assignment

    // for editing students
    else if ($('.clicked').is($('.student'))) {   // if cell is student class)
      console.log('STUDENT!!!!');

      $('.clicked').attr('id', editValue); // set id to the edited value

      studentList.forEach(function(current, index, array){
        if (current.studentName === editValue){ //if this new edited value   WAS already in the student list then don't change anything! make it its original value. no duplicates!
          console.log("that was already in the list! So we're not changing anything!")
          $('.clicked').text(formerText);  // keep the text the same as it was before
          $('.clicked').attr('id', formerText); //keep id same as before
          notFound = false;
        }
      }) //end forEach

      if (notFound === true) {
        console.log("ok new name!")
        // if it was NOT already there, then change the student name and list by CHANGING the studentName on that object that USED TO match the clicked cell's name
        studentList.forEach(function(current, index, array){
          if (current.studentName === formerText) { // find the student name that matches the old text of the clicked cell
            studentList[index].studentName = editValue; //change the matching student name to the edit value
          }
        }) // end forEach

        // studentList[studentList.indexOf(formerText)].studentName = editValue//then replace that index value with the new ones
        console.log("studentlist is now: " + studentList);
      }
      $('.clicked').attr('class', 'editable student'); //make the table cell editable again
    } // end if student

    else if ($('.clicked').is($('.score'))) {   // editing scores needs nothing special since they CAN be duplicated
      console.log("SCORE!!!");
      $('.clicked').attr('class', 'editable score'); //make the table cell editable again
      pointsToAdd += Number($(this).val());
      pointsToDisplay = pointsToAdd;
      console.log("points to dispalay", pointsToDisplay)
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
  pointsToRemove  = Number($(this).text());  //subract off the points in the cell FIRST so the score can be lowered to a new value if needed. otherwise it just gets bigger every time
  console.log("points to remove: " + pointsToRemove)
  }
  else {
    console.log("neither assignment nor student nor score")
  }
  console.log("stored name: " + storedName)
  $(this).addClass('clicked');

  // if ($(this).is('.score')) {
  //   pointsToDisplay = Number($(this).text());
  // }
  // console.log("points to display:", pointsToDisplay)
  pointsToAdd = 0; //number of points to add to student score. resets each time to zero so the value will always be what is entered in in the score box when clicked
  editCells(storedName);
}); // if the cell has class 'editable', then change the class to 'clicked' and edit the cell

$('#update').on('click', function(){
 console.log("this button doesn't do anything!!!!")
 // studentList.forEach(function(current, index, array){
 //    if (current.studentName === storedName) {
 //      current.removePoints();
 //      renderStudents();
 //      console.log(studentList[index])
 //      renderAssignments();
 //    }
 //  })
});

function deleteStudent(studentName){
  var found = false;
  studentList.forEach(function(current, index, array){
    if (current.studentName === studentName) {
      console.log("it was in the list already. Let's delete it!");
      studentList.splice(current, 1);
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
  }
});



function deleteAssignment(assignmentName){
  console.log(assignmentList)
  var found = false;
  assignmentList.forEach(function(current, index, array){
    if (current.assignmentName === assignmentName) {
      console.log("it was in the list already. Let's delete it!");
      console.log(assignmentList)
      var spliced = assignmentList.splice(current, 1);
      found = true;
      console.log(spliced)
    }
    else {
      console.log("false")
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
   renderAssignments();
  }
});


function alphabetizeStudents(){
/*
the for loop always alphabetizes because we start with one item then 2. The array is ALWAYS alphabetized before adding a new student, and becuause the student is beign added to the FRONT of the list (unshift), it always works.
******
Otherwise this would need a while loop to keep iterating over and over until it is order. Then a check to see if any changes were made on the last iteration. If not, end the loop.
*/
var higherAlphabet; //declared in the lexical scope of this function so it cannot be tampered with accidentally (as it could if it was in the global scope) and mess up the  alphabetizing
var lowerAlphabet;
  for (var i = 0; i < studentList.length - 1 ; i++){ // length-1 becasue we do the last comparison on the next-to-last index
    if (studentList[i+1].studentName < studentList[i].studentName){ //if 2 consecutive students are NOT in alphabetical order then...
      higherAlphabet = studentList[i].studentName;  //store the higher value
      lowerAlphabet = studentList[i+1].studentName; //store the higher value
      studentList[i].studentName = lowerAlphabet;  //swap the two values
      studentList[i+1].studentName = higherAlphabet;
    }
  }
}//end alphabetizeStudents()

// function addAllAssignments(){
//   assignmentList.forEach(function(current, index, array){
//     newAssignment.renderTable(assignmentList[index])
//   });
// }
