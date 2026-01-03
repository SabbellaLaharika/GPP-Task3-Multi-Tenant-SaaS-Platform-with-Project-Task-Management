const superAdminService = require('../services/superAdminService');

// Get system-wide statistics
exports.getSystemStats = async (req, res) => {
  try {
    const stats = await superAdminService.getSystemStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics',
      error: error.message
    });
  }
};

// Get all tenants with their statistics
exports.getAllTenantsWithStats = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    
    const result = await superAdminService.getAllTenantsWithStats({ 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get all tenants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenants',
      error: error.message
    });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    
    const result = await superAdminService.getAllProjects({ 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};