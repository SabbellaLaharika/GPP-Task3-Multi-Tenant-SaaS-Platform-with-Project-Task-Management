const projectService = require('../services/projectService');

const createProject = async (req, res, next) => {
  try {
    const result = await projectService.createProject(
      req.body,
      req.user.id,
      req.tenantId
    );
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Project limit reached') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const listProjects = async (req, res, next) => {
  try {
    const result = await projectService.listProjects(req.tenantId, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const result = await projectService.updateProject(
      req.params.projectId,
      req.body,
      req.user.id,
      req.tenantId
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(
      req.params.projectId,
      req.tenantId
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
};
