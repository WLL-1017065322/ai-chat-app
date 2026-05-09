# 每日任务清单
## 周一（5.4）：项目初始化 + 基础路由
创建 Next.js 项目：
npx create-next-app@latest ai-chat-app --typescript --tailwind --app

安装 AI SDK 和依赖：
npm install ai openai edgedb（edgedb 仅为示例，实际用 openai 即可，注意 SDK 版本）

创建 /app/api/chat/route.ts，实现 POST 接口：

接收 { messages }

调用 OpenAI（使用 streamText 或手动 createReadableStream）

返回 Response 对象，Content-Type: text/event-stream

用 Postman 或 curl 测试接口是否能返回流式数据

## 周二（5.5）：前端聊天组件（基础版）
创建 /app/page.tsx，使用 useChat：

tsx
import { useChat } from 'ai/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  // 渲染 messages 列表 + 表单
}
添加简单 CSS（Tailwind 或普通 CSS）让消息气泡可读

处理 loading 状态（useChat 返回的 isLoading）

测试：输入消息能看到流式逐字打印

## 周三（5.6）：增强体验 + 错误处理
安装 react-markdown 和 remark-gfm：
npm install react-markdown remark-gfm

修改消息渲染，将 assistant 消息内容用 Markdown 渲染（代码高亮可选，先不加）

添加简单错误提示：try-catch 包裹前端 handleSubmit，显示 toast 或错误条

场景测试：断网、API key 失效、超时，观察表现

## 周四（5.7）：工具调用（简单版）
修改 /api/chat/route.ts，支持一个假工具（例如 get_current_time）：

在请求体中接收 tools 参数

当 LLM 请求调用时，后端模拟执行并返回结果

前端无需特殊改动（useChat 自动处理 tools 来回）

验证：问“现在几点？” AI 回答当前时间（需要模型支持 tool call，如 gpt-4o-mini）

## 周五（5.8）：部署与调试
注册 Vercel 账号，安装 Vercel CLI（或直接 Git 连接）

将项目推送到 GitHub 仓库

在 Vercel 导入项目，设置环境变量 OPENAI_API_KEY

部署成功后，测试线上版本是否流式正常（注意 CORS 不用处理，同源）

如果遇到超时或函数超时，改为配置 maxDuration

## 周六（5.9）：优化与文档
增加聊天历史持久化（localStorage 简单保存，刷新恢复）

增加“清空对话”按钮

优化移动端样式（响应式）

编写 README：技术栈、本地运行方式、项目截图、在线链接

## 周日（5.10）：复盘与扩展（可选）
录制 1 分钟演示视频（可用 Loom 或 OBS）

根据本周卡点，写下需要继续学习的点（如流式协议细节、错误边界）

可选：添加简单的系统提示词配置（如“你是前端开发助手”）

准备周一（5.11）开始第二周任务（工具调用深度优化或 RAG 准备）

## 验收条件（5.10 晚自检）
本地运行 npm run dev 能流畅对话，内容支持 Markdown

Vercel 线上地址可公开访问，流式输出正常

GitHub 仓库有完整的 commit 记录（至少每天 1 次提交）

能口头解释 /api/chat 如何实现 SSE 流（或者使用了 AI SDK 的 streamText）

