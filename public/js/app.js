'use strict';

console.log('app.js file is being read');

var assignmentList = [];

function newStudent(){
  this.studentName = document.getElementById('studentName').value;
  this.letterGrade = 'need method still...'
  this.percentGrade = 'need method still...'

  var table = document.getElementById('table');
  var newStudentName = document.createElement('tr');
  table.appendChild(newStudentName);
  newStudentName.innerHTML = '<td class="editable">' + this.studentName + '</td> <td class="letterGrade">' + this.letterGrade + '</td> <td class="percentGrade">' + this.percentGrade + '</td>';
  addAllAssignments();  // make columns for all assignments created so far for the new student
}

var addStudent = document.getElementById('addStudent');
addStudent.addEventListener('click', newStudent, false);

//do someting with this.score. not used yet...
function newAssignment(assignmentName){
  // var assignmentName = nameOfAssignment;
  if (assignmentList.indexOf(assignmentName)){ //if the assignment is NOT already in the list then....
    $('#gradePercent').after('<th class="editable" id=' + assignmentName +'>' + assignmentName + '</th>'); //put put new table header  with assignemnt name after the  grade percent column (newest assignment to the left, older ones pushed to the right)
    $('.percentGrade').after('<td class="editable"></td>'); //new table data cells for EVERY student row
    assignmentList.unshift(assignmentName); //put new assignment name in the front of assignmentList array  (reverse order because the assignment cells will show most recent to the left and oldest to the right)
  }
  console.log(assignmentList)
}

var addAssignment = document.getElementById('addAssignment');
addAssignment.addEventListener('click', function() {
  newAssignment(document.getElementById('assignmentName').value)
}, false);


function addAllAssignments(){
  assignmentList.forEach(function(current, index, array){
    newAssignment(assignmentList[index])
  });
}

function editCells(){
  $('.clicked').text(''); // clear the old text
  $('<input>').attr({ type: 'text', id: 'editing'}).appendTo('.clicked'); // insert a text input box
  $('#editing').focus(); //put focus on the new text input box
   console.log( $('#editing').val())
  $('#editing').on('blur', function(){
    var editValue =  $('#editing').val()
    $('.clicked').text(editValue); //set new table cell text
    if ($('.clicked').is($('th'))) {   // if cell is a th element
      $('.clicked').attr('id', editValue); // set id to the edited value
    }
    $('.clicked').attr('class', 'editable'); //make the table cell editable again
    $('#editing').remove(); //remove the text input box
  });
}

$('table').on('click', '.editable',  function(){
  $(this).attr('class', 'clicked');
  editCells();
}); // if the cell has class 'editable', then change the class to 'clicked' and edit the cell

function deleteStudent(){

}

function deleteAssignment(){

}
