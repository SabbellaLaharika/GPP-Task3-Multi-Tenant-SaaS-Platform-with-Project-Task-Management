const dashboardService = require('../services/dashboardService');

exports.getDashboardStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const stats = await dashboardService.getDashboardStats(tenantId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};