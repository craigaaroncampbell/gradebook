'use strict';

//////////////// Delete Data ////////////////////

function deleteObject(name, type){
  var found = false, removedPoints, objectName, placeholderID, putData, dataList;

  if (type === "student"){
    myClass.students.forEach(function(current, index, array){
      if (current.studentName === name) {
        found = true;
        myClass.students.splice(current, 1);
      }
    })
    main.students.put({  "studentArray" : myClass.students})
  } // end if student

  if (type === "assignment") {
    assigmentList.forEach(function(current, index, array){
      if (current.assignmentName === name) {
        found = true;
        myClass.assignments.splice(current, 1);


        myClass.points -= current.points;// NO! THAT ONLY WORKS IF EVERYONE HAS THE FULL POINT VALUE! NEED TO GET THIS FROM THE SCORE OBJECT INSTEAD!
        removedPoints = current.points;
        myClass.assignments.splice(current, 1);
        main.points.put({  "totalPoints" : myClass.points });
        main.assignments.put({  "assignmentArray" : myClass.assignments})

        myClass.students.forEach(function(current, index, array){ // lower every student's score by the same amount tha total points was lowered by
          current.removePoints(removedPoints);
        })
        main.students.put({  "studentArray" : myClass.students})

      }// end  if currrent.assignmentName  = name
    }) // end myClass.assignments.forEach()
  } // end if assignment
  if (!found){ // "not found", get it ? Its clever :)
    console.log("couldn't find it, so I can't delete it!")
  }
}// end deleteObject()


$('#deleteStudent').on('click', function(){
  if ($('#deleteStudentName').val() === '') { //check if there is text in the input field
  console.log("nothing to delete!");
  }
  else {
   deleteObject(properCapitalization($('#deleteStudentName').val()), "student"); // search myClass.students for the object and remove it.
   renderAll();
  }
});

$('#deleteAssignment').on('click', function(){
  if ($('#deleteAssignmentName').val() === '') { //check if there is text in the input field
  console.log("nothing to delete!");
  }
  else {
   deleteObject(properCapitalization($('#deleteAssignmentName').val()), "assignment"); // search myClass.assignments for the object and remove it.
   renderAll();
  }
});
