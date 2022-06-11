const home = (req, res) => {
  return res.status(200).json({
    msg: "Connected to Projects API!",
  });
};

const getAllProjects = (req, res) => {
  const { user } = req;
  if (user) {
    Todo.findOne({ user: user.id })
      .then((user) => {
        const { projects } = user;
        const { alert, noAlert } = validateRandomAlerts(projects);
        if (!noAlert) {
          return res.status(400).json(alert);
        }
        return res.status(200).json(projects);
      })
      .catch((err) => {
        return res.status(400).json(err);
      });
  }
};

module.exports = { home, getAllProjects };
