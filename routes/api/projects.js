const express = require("express"),
  router = express.Router(),
  passport = require("passport");

const {
  home,
  getAllProjects,
  createProject,
  updateProjectName,
  projectCompleted,
  deleteProject,
  deleteAllProjects,
} = require("../../helpers/api/projects");

// Middleware Authentication
const auth = passport.authenticate("jwt", { session: false });

/* Project REST API - Start */

// Route: GET /
// Desc: A route to check if the api is working
// Access: PUBLIC
router.get("/", home);

// Route: GET /all
// Desc: Loads all projects in database
// Access: PRVIATE
router.get("/all", auth, getAllProjects);

// Route: DELETE /project
// Desc: Deletes all projects
// Access: PRIVATE
router.delete("/all", auth, deleteAllProjects);

// Route: POST /project
// Desc: Creates a new project
// Access: PRVIATE
router.post("/new", auth, createProject);

// Route: PUT /project/:id of project
// Desc: Updates the name of the project
// Access: PRVIATE
router.patch("/:project_id", auth, updateProjectName);

// Route: DELETE /:id of project
// Desc: Deletes a project
// Access: PRIVATE
router.delete("/:project_id", auth, deleteProject);

// Route: PUT /project/completed/:id of project
// Desc: Updates whether the project was completed
// Access: PRIVATE
router.patch("/completed/:project_id", auth, projectCompleted);

/* Project REST API - End */

module.exports = router;
