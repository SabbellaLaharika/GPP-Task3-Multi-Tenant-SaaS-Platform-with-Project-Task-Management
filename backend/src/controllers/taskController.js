const taskService = require('../services/taskService');

const createTask = async (req, res, next) => {
  try {
    const result = await taskService.createTask(
      req.params.projectId,
      req.body,
      req.tenantId
    );
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes("doesn't belong")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const listProjectTasks = async (req, res, next) => {
  try {
    const result = await taskService.listProjectTasks(
      req.params.projectId,
      req.tenantId,
      req.query
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const result = await taskService.updateTaskStatus(
      req.params.taskId,
      req.body.status,
      req.tenantId
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes("doesn't belong")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const result = await taskService.updateTask(
      req.params.taskId,
      req.body,
      req.tenantId
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask,
};
