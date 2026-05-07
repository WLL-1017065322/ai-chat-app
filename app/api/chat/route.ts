import { streamText, UIMessage, convertToModelMessages } from 'ai'
import { deepseek} from '@ai-sdk/deepseek'
import { NextResponse } from 'next/server'

// 初始化 OpenAI 客户端
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     baseURL: process.env.OPENAI_BASE_URL,
// })

// 最大响应时间，单位秒
export const maxDuration = 15

export async function POST(request: Request) {
    try { 
        const { messages }= await request.json()
        console.log("messages", messages)
        // 初始化 OpenAI 客户端
        const result  = streamText({
            model: deepseek('deepseek-v4-flash'),
            messages: messages,
            system: '你是我的人工智能助手，协助我解答问题和提供信息。请尽可能详细地回答我的问题，并提供相关的背景信息和示例来支持你的回答。如果你不确定某个问题的答案，请诚实地告诉我，并尽量提供相关的信息或建议。'
        })
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('Error in chat route:', error)
        return NextResponse.json({ error: 'An error occurred while processing the request.' }, { status: 500 })
    }
}