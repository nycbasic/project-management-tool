const express = require("express"),
  router = express.Router(),
  passport = require("passport");

const auth = passport.authenticate("jwt", { session: false });

const { newTask, updateTask } = require("../../helpers/Tasks");

/* Tasks REST API - Start */

// Route: POST /new/:id of project/task
// Desc: Creates new todo in a project
// Access: PRIVATE
router.post("/new/:project_id", auth, newTask);

// Route: PUT /todo/:id of project/:id of todo
// Desc: Updates the title and text of a single todo
// Access: Private
router.patch("/:project_id/:task_id", auth, updateTask);

// Route: PUT /todo/completed/:id of project/:id of todo
// Desc: Update whether the task was completed
// Access: Private
router.put("/todo/completed/:project_id/:todo_id", auth, (req, res) => {
  Todo.findOne({ user: req.user.id })
    .then((user) => {
      const { projects } = user;
      const { project_id, todo_id } = req.params;
      const { current_item, first_index, second_index } = findItem(
        projects,
        { first: project_id, second: todo_id },
        "_id"
      );

      const { noAlert, alert } = validateRandomAlerts(current_item);

      if (!noAlert) {
        return res.status(400).json(alert);
      }

      current_item.completed = !current_item.completed;
      user.save().then(() => {
        return res.status(200).json(projects[first_index].todos[second_index]);
      });
    })
    .catch((err) => {
      if (err) {
        return res.status(400).json({ msg: "Something went wrong!" });
      }
    });
});

// Route: DELETE /todo/:id of project/:id of todo
// Desc: Delete a single todo
// Access: Private
router.delete("/todo/:project_id/:todo_id", auth, (req, res) => {
  Todo.findOne({ user: req.user.id })
    .then((user) => {
      const { projects } = user;
      const { project_id, todo_id } = req.params;
      const { current_item, first_index, second_index } = findItem(
        projects,
        { first: project_id, second: todo_id },
        "_id"
      );
      const { noAlert, alert } = validateRandomAlerts(current_item);

      if (!noAlert) {
        return res.status(400).json(alert);
      }

      projects[first_index].todos.splice(second_index, 1);
      user.save().then(() => {
        return res.json(
          projects[first_index].todos.length < 1
            ? { msg: "No data to display" }
            : projects[first_index].todos
        );
      });
    })
    .catch((err) => {
      if (err) {
        return res.status(400).json({ msg: "Something went wrong!" });
      }
    });
});

// Route: DELETE /todo/:id of project
// Desc: Deletes all of the todos
// Access:
router.delete("/todo/:project_id", auth, (req, res) => {
  Todo.findOne({ user: req.user.id }).then((user) => {
    const { projects } = user;
    const { project_id } = req.params;
    const { current_item, current_index } = findItem(
      projects,
      project_id,
      "_id"
    );

    const { noAlert, alert } = validateRandomAlerts(current_item);

    if (!noAlert) {
      return res.status(400).json(alert);
    }

    current_item.todos = [];
    user.save().then((user) => {
      return res
        .status(200)
        .json(
          user.projects[current_index].todos.length < 1
            ? { msg: "No data to display" }
            : user.projects[current_index].todos
        );
    });
  });
});

/* Todo REST API - End */

module.exports = router;
