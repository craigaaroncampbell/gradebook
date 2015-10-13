'use strict';

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


/////////////// Event Listener //////////////////

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




