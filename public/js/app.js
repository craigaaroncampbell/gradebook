'use strict';

console.log('app.js file is being read');

var assignmentList = [];
var studentList = [];

function Student(studentName){
  this.studentName = studentName //document.getElementById('studentName').value;
  this.letterGrade = 'need method still...'
  this.percentGrade = 'need method still...'
}

Student.prototype.renderStudent = function(){
  if (studentList.indexOf(this.studentName) === -1){ //if the student is NOT already in the list then....
    var table = document.getElementById('table');
    var newRow= document.createElement('tr');
    table.appendChild(newRow);
    newRow.innerHTML = '<td class="editable student" id=" '  + this.studentName + ' ">' + this.studentName + '</td> <td class="letterGrade">' + this.letterGrade + '</td> <td class="percentGrade">' + this.percentGrade + '</td>';
    studentList.unshift(this.studentName);
    console.log(studentList);
  }
}

$('#addStudent').on('click', function(){
    if ($('#studentName').val() === '') { //check if text input field is empty
      console.log("nothing to add!");
    } else {
      var newStudent = new Student($('#studentName').val());
      newStudent.renderStudent();
      alphabetizeStudents();  // alphabetize list of students (in case changes were made to student names)
      // addAllAssignments();  // make columns for all assignments created so far for the new student
   }
});

function Assignment(assignmentName){
  this.assignmentName = assignmentName;
}

Assignment.prototype.renderAssignment = function(assignmentName){
  if (assignmentList.indexOf(assignmentName) === -1){ //if the assignment is NOT already in the list then....
    $('#gradePercent').after('<th class="editable" id=' + assignmentName +'>' + assignmentName + '</th>'); //put put new table header  with assignemnt name after the  grade percent column (newest assignment to the left, older ones pushed to the right)
    $('.percentGrade').after('<td class="editable"></td>'); //new table data cells for EVERY student row
    assignmentList.unshift(assignmentName); //put new assignment name in the front of assignmentList array  (reverse order because the assignment cells will show most recent to the left and oldest to the right)
  }
  console.log(assignmentList)
}

$('#addAssignment').on('click', function(){
  if ($('#assignmentName').val() === '') { //check if there is text in the input field
  console.log("nothing to add!")
} else {
    var newAssignment = new Assignment($('#assignmentName').val())
    newAssignment.renderAssignment($('#assignmentName').val());
  }
});


function editCells(){
  var formerValue = $('.clicked').text();// store the original value before clearing the cell
  console.log("the value used  to be: " + formerValue);
  $('.clicked').text(''); // clear the old text
  $('<input>').attr({ type: 'text', id: 'editing'}).appendTo('.clicked'); // insert a text input box
  $('#editing').focus(); //put focus on the new text input box

  $('#editing').on('blur', function(){
    var editValue =  $('#editing').val()
    $('.clicked').text(editValue); //set new table cell text

    //for editing assignments:
    if ($('.clicked').is($('th'))) {   // if cell is th (i.e. assignment)
      console.log("ASSIGNMENT!!!");
      $('.clicked').attr('id', editValue); // set id to the edited value

      if (assignmentList.indexOf(editValue) !== -1){ //if this new edited value   WAS already in the assignment list then don't change anything! make it its original value. no duplicates!
        console.log("that was already in the list! So we're not changing anything!")
        $('.clicked').text(formerValue);  // keep the text the same as it was before
        $('.clicked').attr('id', formerValue); //keep id same as before
      }
      else {  // if it was NOT already there, then change the assignment name and list
        assignmentList[assignmentList.indexOf(formerValue)] = editValue//then replace that index value with the new ones
        console.log("assignment list is now: " + assignmentList);
      }
      $('.clicked').attr('class', 'editable assignment'); //make the table cell editable again
      $('#editing').remove(); //remove the text input box
    } // end if assignment

    // for editing students
    else if ($('.clicked').is($('td[id]'))) {   // if cell is td with id (i.e. student)
      console.log('STUDENT!!!!');

      $('.clicked').attr('id', editValue); // set id to the edited value

      if (studentList.indexOf(editValue) !== -1){ //if this new edited value   WAS already in the student list then don't change anything! make it its original value. no duplicates!
        console.log("that was already in the list! So we're not changing anything!")
        $('.clicked').text(formerValue);  // keep the text the same as it was before
        $('.clicked').attr('id', formerValue); //keep id same as before
      }
      else {  // if it was NOT already there, then change the assignment name and list
        studentList[studentList.indexOf(formerValue)] = editValue//then replace that index value with the new ones
        console.log("studentlist is now: " + studentList);
      }
      $('.clicked').attr('class', 'editable student'); //make the table cell editable again
      $('#editing').remove(); //remove the text input box
      alphabetizeStudents();  // alphabetize list of students (in case changes were made to student names)
    } // end if student

    else{    // editing scores needs nothing special since they CAN be duplicated
      console.log("ELSE!!!");
      $('.clicked').attr('class', 'editable'); //make the table cell editable again
      $('#editing').remove(); //remove the text input box
    }
  }); // end on.blur
}

$('table').on('click', '.editable',  function(){
  $(this).attr('class', 'clicked');
  editCells();
}); // if the cell has class 'editable', then change the class to 'clicked' and edit the cell

function deleteStudent(){

}

//make event listener for delete student().... INCLUDE alphabetizeStudents() as last part of callback

function deleteAssignment(){

}
// make event listener for deleteAssignment()

function alphabetizeStudents(){

}

// function addAllAssignments(){
//   assignmentList.forEach(function(current, index, array){
//     newAssignment.renderTable(assignmentList[index])
//   });
// }
