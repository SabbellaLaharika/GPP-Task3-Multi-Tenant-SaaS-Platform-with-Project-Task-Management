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
      req.tenantId,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Unauthorized access') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(
      req.params.projectId,
      req.tenantId,
      req.user.id, // Pass userId for audit logging
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Unauthorized access') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// const getProjects = async (req, res) => {
//   try {
//     const { status, search, sortBy, order } = req.query;
//     const userRole = req.user.role;
//     const tenantId = req.user.tenantId;

//     let projects;

//     // Super Admin gets ALL projects across ALL tenants
//     if (userRole === 'super_admin') {
//       projects = await projectService.getAllProjectsForSuperAdmin({
//         status,
//         search,
//         sortBy,
//         order
//       });
//     } else {
//       // Regular users get only their tenant's projects
//       projects = await projectService.getProjects(tenantId, {
//         status,
//         search,
//         sortBy,
//         order
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         projects
//       }
//     });
//   } catch (error) {
//     console.error('Get projects error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch projects',
//       error: error.message
//     });
//   }
// };

module.exports = {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
  //getProjects,
};
