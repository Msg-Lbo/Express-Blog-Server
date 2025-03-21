const query = require('../db');

/**
 * 获取API日志列表
 */
const getApiLogs = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;

    // 查询日志数据
    const logs = await query(
      `SELECT * FROM api_logs 
       ORDER BY access_time DESC
       LIMIT ? OFFSET ?`,
      [Number(pageSize), Number(offset)]
    );

    // 查询总数
    const [totalResult] = await query(
      `SELECT COUNT(*) as total FROM api_logs`
    );
    const itemCount = totalResult[0].total;
    
    return res.json({
      code: 200,
      msg: '获取API日志成功',
      data: {
        list: logs,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          itemCount
        }
      },
      succeed: true
    });
  } catch (err) {
    console.error('获取API日志失败:', err);
    res.status(500).json({
      code: 500,
      message: '获取API日志失败'
    });
  }
};

module.exports = {
  getApiLogs
};
