const query = require('../db');
// 更新标签
const updateTags = async (articleId, tags) => {
    if (!articleId || !tags) {
        return;
    }
    const tagsResult = tags.split(',').map(item => item.trim());
    try {
        // 开启事务
        await query('START TRANSACTION');
        // 清除文章原有的标签关系
        await query('DELETE FROM article_tags WHERE article_id=?', [articleId]);
        // 更新文章的标签
        for (const tag of tagsResult) {
            // 检查标签是否存在
            let [tagExists] = await query('SELECT id FROM tags WHERE label=?', [tag]);
            let tagId;
            if (tagExists.length === 0) {
                // 如果标签不存在，则插入标签表并获取标签ID
                let [insertTagResult] = await query('INSERT INTO tags (label) VALUES (?)', [tag]);
                tagId = insertTagResult.insertId;
            } else {
                // 如果标签已存在，则直接获取标签ID
                tagId = tagExists[0].id;
            }
            // 插入文章标签关系表
            await query('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [articleId, tagId]);
        }
        // 提交事务
        await query('COMMIT');
    } catch (err) {
        // 回滚事务
        await query('ROLLBACK');
        throw err;
    }
};

// 保存文章
exports.saveArticle = async (req, res) => {
    const { id, title, description, content, category_id, create_time, update_time, tags } = req.body;
    // 检查必需参数
    if (!title || !description || !content || !category_id || !create_time) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        if (id) {
            // 更新文章
            const newUpdate_time = update_time ? update_time : Date.now();
            const updateSql = 'UPDATE articles SET title=?, description=?, content=?, category_id=?, update_time=? WHERE id=?';
            const [updateResult] = await query(updateSql, [title, description, content, category_id, newUpdate_time, id]);
            if (updateResult.affectedRows) {
                // 更新标签
                await updateTags(id, tags);
                return res.json({
                    code: 200,
                    msg: '更新成功',
                    succeed: true
                });
            } else {
                return res.json({
                    code: 400,
                    msg: '更新失败'
                });
            }
        } else {
            // 保存文章
            const insertSql = 'INSERT INTO articles (title, description, content, category_id, create_time) VALUES (?, ?, ?, ?, ?)';
            const [insertResult] = await query(insertSql, [title, description, content, category_id, create_time]);
            if (insertResult.affectedRows) {
                const articleId = insertResult.insertId;
                // 处理标签
                await updateTags(articleId, tags);
                return res.json({
                    code: 200,
                    msg: '保存成功',
                    succeed: true
                });
            } else {
                return res.json({
                    code: 400,
                    msg: '保存失败'
                });
            }
        }
    } catch (err) {
        console.error(err);
        return res.json({
            code: 500,
            msg: '服务器错误'
        });
    }
}



// 按创建时间排序分页获取文章列表
exports.getArticleList = async (req, res) => {
    const { page, pageSize } = req.query;
    if (!page || !pageSize) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        // 分类id转为对应的分类名,文章评论数
        const sql = `
        select 
            articles.id, 
            articles.category_id, 
            articles.title, 
            articles.description, 
            articles.create_time, 
            articles.update_time, 
            articles.read_count,
            articles.top,
            categories.category_name as category_name,
            count(comments.id) as comment_count from articles
        left join categories on articles.category_id=categories.id
        left join comments on articles.id=comments.article_id
        group by articles.id
        order by articles.create_time desc
        limit ?, ?`;
        const [result] = await query(sql, [(page - 1) * parseInt(pageSize), parseInt(pageSize)]);
        const sql1 = 'select count(*) as total from articles';
        const [result1] = await query(sql1);
        // top为1的文章放在最前面
        let list = result.sort((a, b) => {
            if (a.top === 1 && b.top === 0) {
                return -1;
            } else if (a.top === 0 && b.top === 1) {
                return 1;
            } else {
                return 0;
            }
        });
        return res.json({
            code: 200,
            msg: '获取成功',
            succeed: true,
            data: {
                list: list,
                total: result1[0].total
            }
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '获取失败'
        });
    }
}

// 置顶或取消置顶文章
exports.topOrUntop = async (req, res) => {
    const { id, top } = req.body;
    if (!id || !top) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        const sql = 'update articles set top=? where id=?';
        const [result] = await query(sql, [top, id]);
        if (result.affectedRows) {
            return res.json({
                code: 200,
                msg: '操作成功',
                succeed: true
            });
        }
        return res.json({
            code: 400,
            msg: '操作失败'
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '操作失败'
        });
    }
}

// 按id删除文章
exports.deleteArticleById = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        const sql = 'delete from articles where id=?';
        const [result] = await query(sql, [id]);
        if (result.affectedRows) {
            return res.json({
                code: 200,
                msg: '删除成功',
                succeed: true
            });
        }
        return res.json({
            code: 400,
            msg: '删除失败'
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '删除失败'
        });
    }
}

// 获取文章详情
exports.getArticleDetail = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        // 阅读数+1
        await query(`update articles set read_count=read_count+1 where id=?`, [id]);
        // 分类id转为对应的分类名,该文章的上一篇和下一篇的id,上一篇和下一篇的标题, 以及tags
        const sql = `
        SELECT 
            articles.id, 
            title, 
            description, 
            content, 
            categories.id AS category_id, 
            categories.category_name AS category_name,
            create_time, 
            update_time,
            (SELECT id FROM articles WHERE id < ${id} ORDER BY id DESC LIMIT 1) AS pre_id,
            (SELECT id FROM articles WHERE id > ${id} ORDER BY id ASC LIMIT 1) AS next_id,
            (SELECT title FROM articles WHERE id < ${id} ORDER BY id DESC LIMIT 1) AS pre_title,
            (SELECT title FROM articles WHERE id > ${id} ORDER BY id ASC LIMIT 1) AS next_title,
            GROUP_CONCAT(tags.label) AS tags
        FROM articles
        LEFT JOIN categories ON articles.category_id = categories.id
        LEFT JOIN article_tags ON articles.id = article_tags.article_id
        LEFT JOIN tags ON article_tags.tag_id = tags.id
        WHERE articles.id = ?
        GROUP BY articles.id`;
        const [result] = await query(sql, [id]);
        const articleData = result[0];
        return res.json({
            code: 200,
            msg: '获取成功',
            succeed: true,
            data: articleData
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '获取失败'
        });
    }
}

// 按文章内容或标题搜索文章
exports.searchArticleByContentOrTitle = async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.json({
            code: 400,
            msg: '参数不完整'
        });
    }
    try {
        // 分类id转为对应的分类名,文章评论数
        const sql = `
            SELECT 
                a.id, 
                a.category_id, 
                a.title, 
                a.description,
                c.category_name AS category_name,
                a.create_time, 
                a.update_time, 
                a.read_count, 
                COUNT(co.id) AS comment_count
            FROM 
                articles a
            LEFT JOIN 
                categories c ON a.category_id = c.id
            LEFT JOIN 
                comments co ON a.id = co.article_id
            WHERE 
                a.title LIKE ? OR a.content LIKE ?
            GROUP BY 
                a.id
            ORDER BY 
                a.create_time DESC, 
                comment_count DESC -- 增加按评论数量降序排序
            LIMIT 
                0, 15;
        `;
        const [result] = await query(sql, [`%${keyword}%`, `%${keyword}%`]);
        return res.json({
            code: 200,
            msg: '搜索成功',
            succeed: true,
            data: {
                list: result
            }
        });
    } catch (err) {
        console.log(err);
        return res.json({
            code: 500,
            msg: '搜索失败'
        });
    }
}
