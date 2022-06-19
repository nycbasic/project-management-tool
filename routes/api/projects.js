const express = require("express"),
  router = express.Router(),
  passport = require("passport");

// Helper function & Todo Model Schema
const findItem = require("../../helpers/index-value");
const Todo = require("../../models/Projects");
const {
  home,
  getAllProjects,
  createProject,
  updateProjectName,
  projectCompleted,
  deleteProject,
} = require("../../helpers/projects");

// Validation Inputs
const {
  validateProjectNameInput,
  validateTodoInputs,
} = require("../../validation/projects");

// Validation check for URL parameters
const validateRandomAlerts = require("../../validation/random");

// Middleware Authentication
const auth = passport.authenticate("jwt", { session: false });

// Route: GET /
// Desc: A route to check if the api is working
// Access: PUBLIC
router.get("/", home);

// Route: GET /all
// Desc: Loads all projects in database
// Access: PRVIATE
router.get("/all", auth, getAllProjects);

/* Project REST API - Start */

// Route: POST /project
// Desc: Creates a new project
// Access: PRVIATE
router.post("/new", auth, createProject);

// Route: PUT /project/:id of project
// Desc: Updates the name of the project
// Access: PRVIATE
router.patch("/project/:project_id", auth, updateProjectName);

// Route: PUT /project/completed/:id of project
// Desc: Updates whether the project was completed
// Access: PRIVATE
router.patch("/project/completed/:project_id", auth, projectCompleted);

// Route: DELETE /project/:id of project
// Desc: Deletes a project
// Access: Private
router.delete("/project/:project_id", auth, deleteProject);

// Route: DELETE /project
// Desc: Deletes all projects
// Access: Private
router.delete("/project", auth, (req, res) => {
  const { id } = req.user;
  Todo.findOne({ user: id })
    .then((user) => {
      const { projects } = user;
      const { noAlert, alert } = validateRandomAlerts(projects);
      if (!noAlert) {
        return res.status(400).json(alert);
      }
      user.projects = [];
      user.save().then((user) => {
        const { projects } = user;
        return res
          .status(200)
          .json(projects.length < 1 ? { msg: "No data to display" } : projects);
      });
    })
    .catch((err) => {
      if (err) {
        return res.status(400).json({ error: "Something went wrong!" });
      }
    });
});

/* Project REST API - End */

/* Todo REST API - Start */

// Route: POST /todo/:id of project
// Desc: Creates new todo in a project
// Access: Private
router.post("/todo/:project_id", auth, (req, res) => {
  Todo.findOne({ user: req.user.id })
    .then((user) => {
      const { projects } = user;
      const { project_id } = req.params;
      const { current_item, current_index } = findItem(
        projects,
        project_id,
        "_id"
      );
      const { isValid, errors } = validateTodoInputs(req.body);
      const { noAlert, alert } = validateRandomAlerts(current_item);
      const { title, text } = req.body;

      if (!isValid) {
        return res.status(400).json(errors);
      }

      if (!noAlert) {
        return res.status(400).json(alert);
      }

      const newTodo = {
        title,
        text,
        completed: false,
      };

      current_item.todos.push(newTodo);
      user.save().then(() => {
        return res.status(200).json(projects[current_index].todos);
      });
    })
    .catch((err) => {
      if (err) {
        return res.status(400).json({ error: "Something went wrong!" });
      }
    });
});

// Route: PUT /todo/:id of project/:id of todo
// Desc: Updates the title and text of a single todo
// Access: Private
router.put("/todo/:project_id/:todo_id", auth, (req, res) => {
  Todo.findOne({ user: req.user.id })
    .then((user) => {
      const { projects } = user;
      const { project_id, todo_id } = req.params;
      const { title, text } = req.body;
      const { current_item, first_index, second_index } = findItem(
        projects,
        { first: project_id, second: todo_id },
        "_id"
      );
      const { isValid, errors } = validateTodoInputs(req.body);
      const { noAlert, alert } = validateRandomAlerts(current_item);

      if (!isValid) {
        return res.status(400).json(errors);
      }

      if (!noAlert) {
        return res.status(400).json(alert);
      }

      current_item.title = title;
      current_item.text = text;
      user.save().then(() => {
        return res.json(projects[first_index].todos[second_index]);
      });
    })
    .catch((err) => {
      if (err) {
        return res.status(400).json({ msg: "Something went wrong!" });
      }
    });
});

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
