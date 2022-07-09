var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

    // check due date
    auditTask(taskLi);


  // append to ul list on the page parent 
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");  // Third Argument its a tasks list added in the bottom 

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array 
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

$("#modalDueDate").datepicker({
  minDate: 1  // Indicates how many dates after the current date we want the limit to kick in
});


$(".list-group").on("click", "p", function() {  // inside the class .list-group when user clicks, inside p the value can be changed
  var text = $(this)
  .text()
  .trim();
  console.log(text);

  var textInput = $("<textarea>")  // It creates an space for the user to be able to type/ edit inside by creating this element
  .addClass("form-control")
  .val(text);  // val it's used to get the values from input, select and textarea

  $(this).replaceWith(textInput);
  textInput.trigger("focus");    // automatically highlight the input box for them

});

$(".list-group").on("blur", "textarea", function(){
  // get the textarea's current value/text
  var text = $(this)
  .val();

  // get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  tasks[status][index].text = text;  //tasks its an objectt, status returns an array, returns object index and .text returns txt property of that object at the given index 
  saveTasks();

  //recreate p element 
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);  // this is refering to textarea object
});


// due date was clicked
$(".list-group").on("click", "span", function(){
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
  .attr("type", "text")    // one argument gets an attribute with two arguments it sets an attribute 
  .addClass("form-control")
  .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,

    onClose: function() {
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  
  });

  // automatically focus on new element
  dateInput.trigger("focus");

});

var auditTask = function(taskEl){

  // get date from task element
  var date = $(taskEl).find("span").text().trim();
  // ensure it worked
  console.log(date); 

  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);
  // this should print out an object for the value of the date variable, but at 5:00pm of that date

   // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }

};

// Next, we'll convert them back when the user clicks outside, it will have the same display as when they first see the task 
 
$(".list-group").on("change", "input[type='text']", function(){

  // get current text
  var date = $(this).val();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
  .closest(".list-group-item")
  .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
  
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// allow the user to move the box around 
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"), // it connects lists with the same class
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
  },
  deactivate: function(event) {
  },
  over: function(event) {
  },
  out: function(event) {
  },
  update: function(event) {  // it updates the localStogra in both lists 

    var tempArr = [];
  // loop over current set of children in sortable list
      $(this).children().each(function() {
        tempArr.push({
          text: $(this)
            .find("p")
            .text()
            .trim(),
          date: $(this)
            .find("span")
            .text()
            .trim()
        });
    // console.log($(this).children());
    //console.log("update", this);
    });
    console.log(tempArr);
    // trim down list's ID to match object property   
    var arrName = $(this)
      .attr("id")
      .replace("list-", "")
    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
    },
  stop: function(event) {
    $(this).removeClass("dropover");
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event,ui){
    ui.draggable.remove();
    console.log("drop")
  },
  over: function(event,ui){
    console.log("over");
  },
  out: function(event,ui){
    console.log("out");
  }

});

// load tasks for the first time
loadTasks();


