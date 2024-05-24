![Express-Blog-Server](https://socialify.git.ci/Msg-Lbo/Express-Blog-Server/image?font=Inter&forks=1&issues=1&language=1&name=1&owner=1&pulls=1&stargazers=1&theme=Auto)
<table>
<tr>
  <td><a href="https://github.com/Msg-Lbo/Express-Blog-Next">前端</a></td>
  <td>Express Blog Next</td>
</tr>
<tr>
  <td><a href="https://github.com/Msg-Lbo/Express-Blog-Server">后端</a></td>
  <td>Express Blog Server(👈就是这里)</td>
</tr>
</table>

## 技术栈
| 后端    | 前端         |
| ------- | ------------ |
| Node.js | Vite         |
| Express | Vue3         |
| Mysql   | Typescript   |
|         | Axios        |
|         | Naive UI     |
|         | Tailwind CSS |
|         | Sass         |

## 项目安装

### 配合前端Readme食用

- 1, 安装 Node.js
- 2, 安装 Mysql
- 3, 跟目录创建.env 文件，配置环境变量

| 变量名         | 参数(例如)                       | 必填 | 备注         |
| -------------- | -------------------------------- | ---- | ------------ |
| HOST           | 0.0.0.0                          | ✔    | 后端地址     |
| PORT           | 9090                             | ✔    | 后端端口     |
| DB_HOST        | 127.0.0.1                        | ✔    | 数据库地址   |
| DB_PORT        | 3306                             | ✔    | 数据库端口   |
| DB_ROOT        | blog                             | ✔    | 数据库名称   |
| DB_USER        | blog                             | ✔    | 数据库用户名 |
| DB_PASSWORD    | your_password                    | ✔    | 数据库密码   |
| EMAIL_SERVICE  | smtp.qq.com                      | ✔    | 邮箱服务地址 |
| EMAIL_PORT     | 465                              | ✔    | 邮箱服务端口 |
| EMAIL_USER     | 123123123@qq.com                 | ✔    | 邮箱用户名   |
| EMAIL_PASS     | your_email_password              | ✔    | 邮箱密码     |
| EMAIL_NAME     | Express Blog                     | ✔    | 邮箱名称     |
| TOKEN_SECRET   | 任意英文字符(不要太长也不要太短) | ✔    | 令牌加密密钥 |
| SESSION_SECRET | 任意英文字符(不要太长也不要太短) | ✔    | 会话加密密钥 |

- 4,安装库
``` bash
  pnpm install
```

- 5,运行
```bash
nodemon app.js
```

