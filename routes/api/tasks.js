const express = require("express"),
  router = express.Router(),
  passport = require("passport");

const auth = passport.authenticate("jwt", { session: false });

const {
  newTask,
  updateTask,
  taskCompleted,
  deleteTask,
  deleteAllTasks,
} = require("../../helpers/api/Tasks");

/* Tasks REST API - Start */

// Route: POST /new/:id of project/task
// Desc: Creates new todo in a project
// Access: PRIVATE
router.post("/new/:project_id", auth, newTask);

// Route: PUT /todo/:id of project/:id of todo
// Desc: Updates the title and text of a single todo
// Access: PRIVATE
router.patch("/:project_id/:task_id", auth, updateTask);

// Route: PUT /todo/completed/:id of project/:id of todo
// Desc: Update whether the task was completed
// Access: PRIVATE
router.patch("/completed/:project_id/:task_id", auth, taskCompleted);

// Route: DELETE /todo/:id of project/:id of todo
// Desc: Delete a single todo
// Access: PRIVATE
router.delete("/:project_id/:todo_id", auth, deleteTask);

// Route: DELETE /todo/:id of project
// Desc: Deletes all of the todos
// Access: PRIVATE
router.delete("/all/:project_id", auth, deleteAllTasks);

/* Todo REST API - End */

module.exports = router;
