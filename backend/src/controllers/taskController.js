const taskService = require('../services/taskService');

const createTask = async (req, res, next) => {
  try {
    const result = await taskService.createTask(
      req.params.projectId,
      req.body,
      req.user.id
    );
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes("Project")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message.includes("assignedTo") || error.message.includes("Due date")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const listProjectTasks = async (req, res, next) => {
  try {
    const result = await taskService.listProjectTasks(
      req.params.projectId,
      req.tenantId,
      req.user.role,
      req.query
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes("invalid")) {
      res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const result = await taskService.updateTaskStatus(
      req.params.taskId,
      req.body.status,
      req.tenantId,
      req.user.id,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes("doesn't belong")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message === 'Task not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const result = await taskService.updateTask(
      req.params.taskId,
      req.body,
      req.tenantId,
      req.user.id,
      req.user.role
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes("doesn't belong")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message.includes("assignedTo") || error.message.includes("Due date") || error.message.includes("No valid fields")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message === 'Task not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(
      req.params.taskId,
      req.tenantId,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    if (error.message.includes("doesn't belong")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message === 'Task not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

const getUserTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await taskService.getUserTasks(id);
    res.status(200).json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user tasks',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getUserTasks,
};
