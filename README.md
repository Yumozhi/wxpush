# WXPush - 微信消息推送服务 (Cloudflare Workers)

这是一个基于 [Cloudflare Workers](https://workers.cloudflare.com/) 搭建的、轻量级的微信公众号模板消息推送服务。它提供了一个简单的 API 接口，让您可以轻松地通过 HTTP 请求将消息推送到指定的微信用户。

## ✨ 特性

✅ 完全免费  
✅ 每天 10 万次额度，个人用不完  
✅ 真正的微信原生弹窗 + 声音提醒  
✅ 支持多用户  
✅ 跳转稳定  
✅ 可无限换皮肤 (使用项目[wxpushSkin](https://github.com/frankiejun/wxpushSkin))  
✅ 支持docker部署

## 🎬 视频教学

我们制作了详细的视频教程，手把手教您如何完成所有部署步骤。如果您偏爱视频指导，请点击下方链接观看：

[<img src="https://look.pics.cloudns.ch/img/极简微信消息推送服务-封面.jpg" alt="点击观看视频教程" width="480">](https://youtu.be/sE1Kcol_XRs?si=G-UbUGlMhyysv-US)  

[<img src="https://look.pics.cloudns.ch/img/%E5%A6%82%E4%BD%95%E7%A8%B3%E5%AE%9A%E9%83%A8%E7%BD%B2wxpushskin%E9%A1%B9%E7%9B%AE-%E5%B0%81%E9%9D%A2.jpg" alt="点击观看视频教程" width="480">](https://www.youtube.com/watch?v=Hf5_LOyjLWU)

*点击上方图片或链接，即可跳转到 YouTube 观看视频教程。*




## 🚀 部署指南

我们提供多种简单的部署方式，您可以根据自己的需求选择其中一种。

### 方法一：直接粘贴代码到 Cloudflare (最简单)

这种方法无需任何本地开发环境，只需复制粘贴即可完成部署。

1.  **登录 Cloudflare 仪表板**
    *   打开浏览器，访问 [https://dash.cloudflare.com/](https://dash.cloudflare.com/) 并登录。

2.  **创建 Worker 服务**
    *   在左侧菜单中，选择 **Workers 和 Pages**。
    *   点击 **创建应用程序**，然后选择 **创建 Worker**。
    *   为您的 Worker 指定一个全局唯一的名称 (例如 `my-wxpush-service`)，然后点击 **部署**。

3.  **粘贴代码**
    *   部署完成后，点击 **编辑代码** 进入在线代码编辑器。
    *   删除编辑器中所有的默认代码。
    *   将项目 `src/index.js` 文件中的全部内容复制并粘贴到编辑器中。

4.  **保存并部署**
    *   点击编辑器右上角的 **保存并部署** 按钮。

5.  **配置环境变量 (重要)**
    *   返回 Worker 的主管理页面，进入 **设置** > **变量**。
    *   在 **环境变量** 部分，点击 **添加变量**，依次添加以下配置。这些是服务运行所必需的敏感信息。
        *   `API_TOKEN`: 用于接口调用的访问令牌，请设置一个足够复杂的随机字符串。
        *   `WX_APPID`: 您的微信公众号 AppID。
        *   `WX_SECRET`: 您的微信公众号 AppSecret。
        *   `WX_USERID`: 默认接收消息用户的 OpenID，多个用户请用 `|` 符号分隔 (例如 `openid1|openid2`)。
        *   `WX_TEMPLATE_ID`: 您要使用的微信模板消息 ID。
        *   `WX_BASE_URL`: (可选) 点击模板消息后跳转的基础 URL。
    *   **注意**：添加变量时，请确保勾选 **加密** 选项，以保护您的凭证安全。

### 方法二：Docker 直接部署（需要有docker环境）

**拉取镜像**

```bash
docker pull ghcr.io/frankiejun/wxpush:latest
```

**运行容器**

```bash
docker run -d --name wxpush \
  -p 3939:3939 \
  -e API_TOKEN="your_token" \
  -e WX_APPID="your_appid" \
  -e WX_SECRET="your_secret" \
  -e WX_USERID="openid1|openid2" \
  -e WX_TEMPLATE_ID="your_template_id" \
  -e WX_BASE_URL="https://example.com" \
  -e PORT="3939" \
  ghcr.io/frankiejun/wxpush:latest
```

**docker-compose**

创建 `docker-compose.yml`，直接使用镜像运行：

```yaml
services:
  wxpush:
    image: ghcr.io/frankiejun/wxpush:latest
    ports:
      - "3939:3939"
    environment:
      API_TOKEN: "your_token"
      WX_APPID: "your_appid"
      WX_SECRET: "your_secret"
      WX_USERID: "openid1|openid2"
      WX_TEMPLATE_ID: "your_template_id"
      WX_BASE_URL: "https://example.com"
      PORT: "3939"
    restart: unless-stopped
```

### 方法三：通过关联 GitHub 仓库自动部署

如果您希望通过 Git 进行版本控制和持续集成，推荐使用此方法。

1.  **Fork 或克隆项目**
    *   首先，将本项目 Fork 到您自己的 GitHub 账户，或者克隆后推送到您自己的新仓库。

2.  **连接到 GitHub**
    *   登录 Cloudflare 仪表板，进入 **Workers 和 Pages**。
    *   点击 **创建应用程序**，切换到 **Pages** 选项卡，然后点击 **连接到 Git**。

3.  **选择仓库**
    *   选择您刚刚创建的 GitHub 仓库。

4.  **配置构建和部署**
    *   **项目名称**：为您项目指定一个名称。
    *   **生产分支**：选择您希望部署的分支 (通常是 `main` 或 `master`)。
    *   **框架预设**：选择 `None`。
    *   **构建设置**：将所有构建相关的字段 (如构建命令、输出目录) 留空。
    *   **根目录**：保持默认的 `/` 即可。

5.  **添加环境变量**
    *   在配置页面的 **环境变量** 部分，添加与 **方法一** 中相同的 `API_TOKEN`, `WX_APPID`, `WX_SECRET` 等变量。
    *   同样，请务必为每个变量勾选 **加密** 选项。

6.  **保存并部署**
    *   点击 **保存并部署**。Cloudflare 会自动从您的仓库拉取代码并完成部署。
    *   此后，每当您向指定的生产分支推送新的代码提交时，Cloudflare 都会自动为您重新部署。

部署成功后，您的服务访问地址会显示在 Worker 或 Pages 的主页面上。

## ⚙️ API 使用方法

服务部署成功后，您可以通过构造 URL 发起 `GET` 请求来推送消息。

### 请求地址

```
https://<您的Worker地址>/wxsend
```

### 请求参数

| 参数名      | 类型   | 是否必填 | 描述                                           |
|-------------|--------|----------|------------------------------------------------|
| `token`     | String | 是       | 您在 `API_TOKEN` 中设置的访问令牌。            |
| `title`     | String | 是       | 消息的标题。                                   |
| `content`   | String | 是       | 消息的具体内容。                               |
| `appid`     | String | 否       | 临时覆盖默认的微信 AppID。                     |
| `secret`    | String | 否       | 临时覆盖默认的微信 AppSecret。                 |
| `userid`    | String | 否       | 临时覆盖默认的接收用户 OpenID。                  |
| `template_id`| String | 否       | 临时覆盖默认的模板消息 ID。                    |
| `base_url`  | String | 否       | 临时覆盖默认的跳转 URL。                       |

### 使用示例

**基础推送**

向默认配置的所有用户推送一条消息：

```
https://<您的Worker地址>/wxsend?title=服务器通知&content=服务已于北京时间%2022:00%20重启&token=your_secret_token
```

**临时覆盖用户**

向一个临时指定的用户推送消息：

```
https://<您的Worker地址>/wxsend?title=私人提醒&content=记得带钥匙&token=your_secret_token&userid=temporary_openid_here
```

### Webhook / POST 请求

除了 `GET` 请求，服务也支持 `POST` 方法，更适合用于自动化的 Webhook 集成。

**请求地址**

```
https://<您的Worker地址>/wxsend
```

**请求方法**

```
POST
```

**请求头 (Headers)**

```json
{
  "Authorization": "你的token",
  "Content-Type": "application/json"
}
```

**请求体 (Body)**

请求体需要是一个 JSON 对象，包含与 `GET` 请求相同的参数。

```json
{
  "title": "Webhook 通知",
  "content": "这是一个通过 POST 请求发送的 Webhook 消息。"
}
```

**使用示例 (cURL)**

```bash
curl -X POST \
  "https://<您的Worker地址>/wxsend" \
  -H "Authorization: 你的token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "来自 cURL 的消息",
    "content": "自动化任务已完成。"
  }'
```

### 成功响应

如果消息成功发送给至少一个用户，服务会返回 `HTTP 200` 状态码和 JSON：

```json
{
  "msg": "Successfully sent messages to 1 user(s). First response: ok"
}
```

### 失败响应

如果发生错误（如 token 错误、缺少参数、微信接口调用失败等），服务会返回相应的 `HTTP 4xx` 或 `5xx` 状态码和 JSON：

```json
{
  "msg": "Invalid token"
}
```

## 🛡️ 测试账号保活 (可选)

如果您长时间不会通过本服务收到消息（例如低频使用），微信可能因测试账号长期不活跃而将其回收作废。此时可以开启**保活心跳**：Worker 会通过 Cron Trigger 定时运行，每隔指定天数自动给自己发送一条测试消息，以此保持测试账号活跃，同时也能在账号失效时通过日志及时发现。

**适合人群**：长时间不会收到消息的账号。**若经常收到消息，无需设置**，可忽略本节。

**设置方法**：

1. 无需修改代码，`wrangler.toml` 中已内置每日触发的 Cron Trigger。
2. 在 Cloudflare Worker 的 **设置** > **变量** 中添加环境变量：
    *   `ALIVE_DAYS`: 保活间隔天数，例如 `30` 表示每 30 天发送一次测试消息。
3. 保存并重新部署即可生效。

**说明**：

*   **不设置 `ALIVE_DAYS` 则不会运行保活心跳**，行为与之前完全一致。
*   保活消息会发送给 `WX_USERID` 中配置的所有用户，标题为"保活测试"。
*   若获取 token 或发送失败，只会在 Worker 日志中记录错误（可通过 Cloudflare 控制台的"日志"查看），此时建议扫码重新登录 [测试号后台](https://mp.weixin.qq.com/debug/cgi-bin/sandbox) 确认账号状态。

## 🤝 贡献

欢迎任何形式的贡献！如果您有好的想法或发现了 Bug，请随时提交 Pull Request 或创建 Issue。

## 📜 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

## 自定义模板字段（兼容现有 title/content）

`template_id` 仍可按请求覆盖默认模板。新增可选 `template_data`，直接指定模板中的任意变量；值可为字符串、数字、布尔值，或微信格式的 `{ "value": "内容", "color": "#00ff00" }`。未传自定义字段时，原有 `title/content`、默认模板、接收人、详情链接、认证方式和保活任务保持原行为。

```json
{
  "title": "UTC0 止损生效",
  "content": "ADAUSDT 已建立交易所侧止损",
  "template_id": "你的模板ID",
  "template_data": {
    "event": { "value": "UTC0 止损生效" },
    "message": { "value": "ADAUSDT 已建立交易所侧止损" }
  }
}
```

对 `/wxsend` 发起 POST，使用原来的 `Authorization: Bearer <token>`。`title/content` 在自定义模式可省略；也支持微信式 `{ "template_id": "...", "data": { "event": "...", "message": "..." } }`。原来的 `{ "data": { "title": "...", "content": "..." } }` 包装请求继续可用。

GET 或表单请求可将 `template_data` 传为 JSON 字符串；不建议把 Token 放在 URL，优先使用认证请求头。非法或空字段对象会在向微信发送前返回 400，不能覆盖 `touser`、模板、应用凭据等服务端参数。

成功响应保留原来的 `msg`，新增 `successful` 和 `failed` 接收人计数。原有调用可继续检查 HTTP 状态；需要确认所有接收人均成功的调用应额外检查 `failed === 0`。推送接口回执并不代表用户已经阅读消息。

无需安装依赖，使用 Node.js 运行 `node --test tests/*.test.mjs` 验证新模板、旧调用、嵌套包装、认证、非法参数和部分接收人失败。


## 简洁消息详情页

`/skin` 使用内置、无外部依赖的页面，源码为 `src/landing/index.html`。修改后运行
`npm run build:landing` 将页面嵌入 Worker，再运行 `npm test`。`npm run preview`
可在本机打开 `http://127.0.0.1:8391/preview/` 查看模拟示例。

- 请求中的 `base_url` 优先，其次是 Worker 的 `WX_BASE_URL`；均未配置时使用当前 Worker 的 `/skin`。
- 要独立迁移详情页，调用方省略 `base_url`，将同一 HTML 托管至新地址后修改 `WX_BASE_URL`。
- 显式的外层 `content` 有内容时只展示正文；否则逐项显示全部 `template_data`，不推断或特别处理字段名。
- `title` 和 `date` 作为外层页面元数据；模板内的同名字段仍然按普通字段显示。
- 自定义字段通过 URL fragment 中的 `data` JSON 传入；旧版 `?title=&message=&date=` 链接继续可用。
- 桌面和手机统一采用 label 在上、内容在下的布局，内容占满整行。
- 页面使用纯文本输出，不执行模板内容中的 HTML，也不依赖远程 Markdown 库。
- 单文件 HTML 可以放在其他静态托管平台，主机需支持 HTTPS 和保留 URL fragment。

部署已有 Worker 时保留控制台变量、Secret、路由及 Cron。仓库中的示例 Worker 名为 `wxpush`；
部署到已有实例应明确使用实例的实际名称，不能直接覆盖生产配置。
