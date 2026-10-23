# 消息详情页预览

运行 `npm run preview` 后打开 `http://127.0.0.1:8391/preview/`。可切换执行结果、未交易、执行异常、自定义字段和旧格式，以及手机/桌面宽度。“修改样例参数”支持编辑 JSON。所有示例均为模拟数据，不发送通知，不调用微信或交易 API。

页面在桌面和手机上统一使用上下结构：label 在上、内容在下，值使用整行宽度。不包含复制按钮、底部署名或正文“详情”标签。

独立源码是 `src/landing/index.html`。修改后运行 `npm run build:landing` 同步到 Worker 的 `src/index.js`，再运行 `npm test`。Worker 保持单 JS 文件，兼容复制部署；测试核对内嵌 HTML 与独立页一致。

## 数据与兼容

- 外层 `title/date` 是页面元数据。非空外层 `content` 存在时显示正文，否则按顺序列出全部 `template_data`。
- 模板内部不特殊处理任何字段名，`strategy/event/message/content/title/date` 都按普通字段显示；保留 `0/false`，不猜测标签含义，不读取微信模板正文。
- 支持微信的 `{value,color}` 字段格式，但页面不采纳颜色。内容使用纯文本并保留换行，不执行 HTML。
- 新自定义消息链接使用 `#data=<URLSearchParams 编码的 JSON>`。外层 content 只有显式提供时才进入链接，不从模板字段推断。
- 旧 `?title=&message=&date=` 链接兼容；没有模板字段时 query message 是旧正文别名。
- 请求 base_url 优先于 Worker 的 WX_BASE_URL；均未配置则回退到当前 Worker 的 /skin。

## 分离托管

详情页只有 HTML/CSS/JS，无远程字体、脚本或接口请求，可放到已有 HTTPS 静态站点、对象存储或 Nginx。保留 URL fragment 即可，不能使用已有 fragment 作为静态站点路由。fragment 不会随请求传给静态服务器，但持有完整链接者仍能读取消息。

发送接口含凭据和微信 API 调用，仍需 Worker 或后端。要迁移详情页，调用方省略 base_url，再修改 WX_BASE_URL。显式传入 base_url 的调用方需独立修改；已发送消息的链接不会自动变化。

微信客户端的实际点击、长链接以及部署域名可达性需要真机验证；桌面预览不代表手机端已经验证。对象存储的域名、备案和默认域名限制须按托管商要求配置。
