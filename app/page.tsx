import { useChat } from '@ai-sdk/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg ${
              m.role === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-black self-start'
            }`}
          >
            <strong>{m.role === 'user' ? '我：' : 'AI：'}</strong>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {isLoading && <div className="text-gray-500">AI 正在思考...</div>}
        {error && <div className="text-red-500">出错了：{error.message}</div>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={handleInputChange}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} className="bg-blue-500 text-white px-4 rounded">
          发送
        </button>
      </form>
    </div>
  );
}