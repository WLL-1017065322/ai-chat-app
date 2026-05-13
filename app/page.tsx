'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, error, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  console.log('Current messages:', messages);
  const isLoading = status === 'submitted' || status === 'streaming';
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageListRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  // 辅助函数：判断是否为工具调用 part
  const isToolPart = (part: any): boolean => {
    return part.type && typeof part.type === 'string' && part.type.startsWith('tool-');
  };

  // 辅助函数：提取工具名称
  const getToolName = (part: any): string => {
    if (part.toolName) return part.toolName;
    const match = part.type?.match(/^tool-(.+)$/);
    return match ? match[1] : 'unknown';
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 w-96">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col space-y-2">
            {/* 消息气泡（用户或AI的主要文本） */}
            <div
              className={`p-3 rounded-lg ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white self-end'
                  : 'bg-gray-200 text-black self-start'
              }`}
            >
              <strong>{m.role === 'user' ? '我：' : 'AI：'}</strong>
              {/* 渲染 parts 中的文本内容 */}
              {m.parts.map((part, i) => {
                if (part.type === 'text') {
                  // 用户消息直接显示纯文本，AI 消息支持 Markdown
                  return m.role === 'user' ? (
                    <div className="whitespace-pre-wrap" key={`${m.id}-${i}`}>
                      {part.text}
                    </div>
                  ) : (
                    <ReactMarkdown key={`${m.id}-${i}`} remarkPlugins={[remarkGfm]}>
                      {part.text}
                    </ReactMarkdown>
                  );
                } else if (isToolPart(part)) {
                  // 工具调用的文本部分（如果有）可以特殊标记
                  const toolPart = part as any;
                  return (
                    <div className="whitespace-pre-wrap" key={`${m.id}-${i}`}>
                      {toolPart.output}
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* 工具调用及推理过程（独立于气泡，作为系统日志展示） */}
            {m.parts.length > 0 && (
              <div className="text-xs text-gray-500 border-l-2 border-gray-300 pl-2 ml-2 space-y-1">
                {m.parts.map((part, idx) => {
                  // 步骤开始
                  if (part.type === 'step-start') {
                    return (
                      <div key={`${m.id}-step-${idx}`} className="flex items-start gap-1">
                        <span>⚙️</span>
                        <span>开始处理</span>
                      </div>
                    );
                  }
                  // 推理内容
                  if (part.type === 'reasoning') {
                    return (
                      <div key={`${m.id}-reason-${idx}`} className="flex items-start gap-1 text-gray-400">
                        <span>🧠</span>
                        <span>推理：{part.text}</span>
                      </div>
                    );
                  }
                  // 工具调用
                  if (isToolPart(part)) {
                    const toolPart = part as any; // 先断言为 any，后续可根据实际结构细化类型 
                    const toolName = getToolName(toolPart);
                    const isComplete = toolPart.state === 'output-available';
                    const output = toolPart.output
                      ? typeof toolPart.output === 'string'
                        ? toolPart.output
                        : JSON.stringify(toolPart.output)
                      : '';
                    const inputArgs = toolPart.input ? JSON.stringify(toolPart.input) : '';
                    return (
                      <div key={`${m.id}-tool-${idx}`} className="flex items-start gap-1">
                        <span>🔧</span>
                        <span>
                          <strong>{toolName}</strong> 调用
                          {inputArgs && inputArgs !== '{}' && <> 参数：{inputArgs}</>}
                          {isComplete && output && <> → 结果：{output}</>}
                          {!isComplete && <span className="text-yellow-500"> 进行中...</span>}
                        </span>
                      </div>
                    );
                  }
                  // 其他类型暂不处理，但可打印调试
                  return null;
                })}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500 flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
            AI 正在思考...
          </div>
        )}
        {error && (
          <div className="text-red-500 p-2 bg-red-100 rounded">
            ⚠️ 错误：{error.message}
          </div>
        )}
        <div ref={messageListRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="bg-red-500 text-white px-4 rounded cursor-pointer"
          >
            停止
          </button>
        ) : (
          <button type="submit" className="bg-blue-500 text-white px-4 rounded cursor-pointer">
            发送
          </button>
        )}
      </form>
    </div>
  );
}