'use strict';

console.log('app.js file is being read');

function newStudent(){
  this.studentName = document.getElementById('studentName').value;
  this.letterGrade = 'need method still...'
  this.percentGrade = 'need method still...'

  var table = document.getElementById('table');
  var newStudentName = document.createElement('tr');
  table.appendChild(newStudentName);
  newStudentName.innerHTML = '<td class="editable">' + this.studentName + '</td> <td class="letterGrade">' + this.letterGrade + '</td> <td class="percentGrade">' + this.percentGrade + '</td>';
}

var addStudent = document.getElementById('addStudent');
addStudent.addEventListener('click', newStudent, false);


function newAssignment(score){
  this.score = score;
  var assignmentName = document.getElementById('assignmentName').value;
  var newAssignmentName = document.createElement('td');
  $('#gradePercent').after('<th class="editable" id=' + assignmentName +'>' + assignmentName + '</th>');
  $('.percentGrade').after('<td class="editable"></td>');
}

var addAssignment = document.getElementById('addAssignment');
addAssignment.addEventListener('click', newAssignment, false);

function editCells(){
  $('.clicked').text(''); // clear the old text
  $('<input>').attr({ type: 'text', id: 'editing', name: 'editing'}).appendTo('.clicked'); // insert a text input box
  $('#editing').focus();
  $('#editing').on('blur', function(){
    $('.clicked').text($('#editing').val()); //set new table cell text
    $('.clicked').attr('class', 'editable'); //make the table cell editable again
    $('#editing').remove(); //remove the text input box
  });
}

$('table').on('click', '.editable',  function(){
  $(this).attr('class', 'clicked');
  editCells();
});

