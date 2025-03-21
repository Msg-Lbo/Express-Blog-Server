const query = require('../db');

/**
 * API访问日志中间件
 */
const apiLogger = async (req, res, next) => {
  const startTime = Date.now();
  
  // 记录响应完成后的日志
  res.on('finish', async () => {
    try {
      
      const logData = {
        ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || "未获取到IP地址",
        url: req.originalUrl || "未获取到请求URL",
        params: JSON.stringify(req.body) || "未获取到请求参数",
        result: JSON.stringify(res.locals.data || "未获取到响应数据"),
        create_time: Date.now() ,
        use_time: Date.now() - startTime,
        status: res.statusCode || "未获取到响应状态码",
        access_time: startTime
      };
      
      await query(
        'INSERT INTO api_logs (ip, url, params, result, create_time, use_time, status, access_time) VALUES (?,?,?,?,?,?,?,?)',
        [logData.ip, logData.url, logData.params, logData.result, logData.create_time, logData.use_time, logData.status, logData.access_time]
      );
    } catch (err) {
      console.error('记录API日志失败:', err);
    }
  });

  next();
};

module.exports = apiLogger;
