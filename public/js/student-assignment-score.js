'use strict'

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
      mongo.students.put({ "studentArray" : myClass.students });
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

$('#addStudent').on('click', function(){
    if ($('#studentName').val() === '') { //check if text input field is empty
      console.log("Nothing to add! Enter a new student name!");
    }
    else {
      new Student(properCapitalization($('#studentName').val())).addStudent();
      renderAll();
    }
  });

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
    mongo.assignments.put({ "assignmentArray" : myClass.assignments });
    mongo.points.put({ "totalPoints" : myClass.points });
    }
};

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

