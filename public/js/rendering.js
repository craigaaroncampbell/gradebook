'use strict';

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

