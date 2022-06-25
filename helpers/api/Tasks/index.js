const Projects = require("../../../models/Projects");
const { validateTaskInputs } = require("../../../validation/projects");
const validateRandomAlerts = require("../../../validation/random");

const findItem = require("../../index-value");

const newTask = (req, res) => {
  Projects.findOne({ user: req.user.id })
    .then((user) => {
      const { projects } = user;
      const { project_id } = req.params;
      const { current_item, current_index } = findItem(
        projects,
        project_id,
        "_id"
      );
      const { isValid, errors } = validateTaskInputs(req.body);
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

      current_item.tasks.push(newTodo);
      user.save().then(() => {
        return res.status(200).json(projects[current_index].tasks);
      });
    })
    .catch((err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Cannot read properties of undefined" });
      }
    });
};

const updateTask = (req, res) => {
  Projects.findOne({ user: req.user.id })
    .then((user) => {
      const { projects } = user;
      const { project_id, task_id } = req.params;
      const { title, text } = req.body;
      const { current_item, first_index, second_index } = findItem(
        projects,
        { first: project_id, second: task_id },
        "_id"
      );
      const { isValid, errors } = validateTaskInputs(req.body);
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
        return res.json(projects[first_index].tasks[second_index]);
      });
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ msg: "Something went wrong!" });
      }
    });
};

const taskCompleted = (req, res) => {
  Projects.findOne({ user: req.user.id })
    .then((user) => {
      const { projects } = user;
      const { project_id, task_id } = req.params;
      const { current_item, first_index, second_index } = findItem(
        projects,
        { first: project_id, second: task_id },
        "_id"
      );

      const { noAlert, alert } = validateRandomAlerts(current_item);

      if (!noAlert) {
        return res.status(400).json(alert);
      }

      current_item.completed = !current_item.completed;
      user.save().then(() => {
        return res.status(200).json(projects[first_index].tasks[second_index]);
      });
    })
    .catch((err) => {
      if (err) {
        return res.status(400).json({ msg: "Something went wrong!" });
      }
    });
};

const deleteTask = (req, res) => {
  Projects.findOne({ user: req.user.id })
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

      projects[first_index].tasks.splice(second_index, 1);
      user.save().then(() => {
        return res.json(
          projects[first_index].tasks.length < 1
            ? { msg: "Task deleted!" }
            : projects[first_index].todos
        );
      });
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ msg: "Something went wrong!" });
      }
    });
};

const deleteAllTasks = (req, res) => {
  Projects.findOne({ user: req.user.id }).then((user) => {
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

    current_item.tasks = [];
    user.save().then((user) => {
      return res
        .status(200)
        .json(
          user.projects[current_index].tasks.length < 1
            ? { msg: "All tasks have been deleted!" }
            : user.projects[current_index].tasks
        );
    });
  });
};

module.exports = {
  newTask,
  updateTask,
  taskCompleted,
  deleteTask,
  deleteAllTasks,
};
