const Projects = require("../../models/Projects");

const validateRandomAlerts = require("../../validation/random");
const { validateProjectNameInput } = require("../../validation/projects");

const findItem = require("../../helpers/index-value");

const home = (req, res) => {
  return res.status(200).json({
    msg: "Connected to Projects API!",
  });
};

const getAllProjects = (req, res) => {
  const { user } = req;
  if (user) {
    Projects.findOne({ user: user.id })
      .then((user) => {
        // Checks if the user has projects
        if (!user) {
          return res.status(500).json({ msg: "No projects found!" });
        }
        // Run if user projects are found
        const { projects } = user;
        const { alert, noAlert } = validateRandomAlerts(projects);
        if (!noAlert) {
          return res.status(400).json(alert);
        }
        return res.status(200).json(projects);
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json(err);
      });
  }
};

const createProject = (req, res) => {
  const { isValid, errors } = validateProjectNameInput(req.body);
  const { name } = req.body;
  const { id } = req.user;
  Projects.findOne({ user: id })
    .then((user) => {
      if (!isValid) {
        return res.status(400).json(errors);
      }

      if (!user) {
        const newProject = new Projects({
          user: id,
          projects: [
            {
              name,
              todos: [],
            },
          ],
          completed: false,
        });

        newProject.save().then((projects) => {
          return res.json(projects);
        });
      } else {
        const newProject = {
          name,
          todos: [],
          completed: false,
        };

        user.projects.push(newProject);
        user.save().then((user) => {
          return res.status(200).json(user.projects);
        });
      }
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: "Something went wrong!" });
      }
    });
};

const updateProjectName = (req, res) => {
  Projects.findOne({ user: req.user.id })
    .then((user) => {
      const { projects } = user;
      const { project_id } = req.params;
      const { current_item, current_index } = findItem(
        projects,
        project_id,
        "_id"
      );
      const { isValid, errors } = validateProjectNameInput(req.body);
      const { noAlert, alert } = validateRandomAlerts(current_item);

      if (!isValid) {
        return res.status(400).json(errors);
      }

      if (!noAlert) {
        return res.status(400).json(alert);
      }

      current_item.name = req.body.name;
      current_item.date = Date.now();
      user.save().then(() => {
        return res.status(200).json(projects[current_index]);
      });
    })
    .catch((err) => {
      if (err) {
        return res.status(400).json({ error: "Something went wrong!" });
      }
    });
};

const projectCompleted = (req, res) => {
  Projects.findOne({ user: req.user.id })
    .then((user) => {
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
      current_item.completed = !current_item.completed;
      user.save().then(() => {
        console.log("Marked project as completed!");
        return res.status(200).json(projects[current_index]);
      });
    })
    .catch((err) => {
      if (err) {
        return res.status(400).json({ error: "Something went wrong!" });
      }
    });
};

const deleteProject = (req, res) => {
  const { id } = req.user;
  Projects.findOne({ user: id })
    .then((user) => {
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
      projects.splice(current_index, 1);
      user.save().then(() => {
        return res
          .status(200)
          .json(projects.length < 1 ? { msg: "project deleted" } : projects);
      });
    })
    .catch((err) => {
      if (err) {
        return res.status(400).json({ error: "Something went wrong!" });
      }
    });
};

const deleteAllProjects = (req, res) => {
  const { id } = req.user;
  Projects.findOne({ user: id })
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
          .json(
            projects.length < 1
              ? { msg: "all projects has been removed" }
              : projects
          );
      });
    })
    .catch((err) => {
      if (err) {
        return res.status(400).json({ error: "Something went wrong!" });
      }
    });
};

module.exports = {
  home,
  getAllProjects,
  createProject,
  updateProjectName,
  projectCompleted,
  deleteProject,
  deleteAllProjects,
};
