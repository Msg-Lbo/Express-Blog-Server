const mysql = require('mysql2/promise');
const dotenv = require("dotenv")
dotenv.config()
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_ROOT } = process.env
// 创建数据库连接池
const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_ROOT,
    // 连接池最大连接数
    connectionLimit: 10,
    // 是否等待连接池获得连接，为true时，如果没有连接，则不执行查询操作
    waitForConnections: true,
    // 查询操作队列最大限制
    queueLimit: 0,
    // 连接空闲超时时间
    idleTimeout: 60000,
    // 连接超时时间
    connectTimeout: 6000,
    // 连接错误时打印错误信息
    debug: false
});

// 使用数据库连接池执行查询
const query = async (sql, params) => {
    // 获取数据库连接
    try {
        // 获取数据库连接
        const conn = await pool.getConnection();
        // 执行sql语句，并传入参数
        const result = await conn.query(sql, params);
        // 释放数据库连接
        conn.release();
        // 返回执行结果
        return result;
    } catch (err) {
        // 打印错误信息
        console.log(err);

        if (err.code === 'ECONNRESET') {
            // 连接丢失，重新连接
            return query(sql, params);
        }
        // 抛出错误
        throw { message: '数据库查询失败,可能是连接信息有误', code: err };
    }
};

module.exports = query