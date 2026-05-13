import { streamText, generateText , UIMessage, convertToModelMessages, tool, stepCountIs, ModelMessage } from 'ai'
import { deepseek} from '@ai-sdk/deepseek'
import { NextResponse } from 'next/server'
import { z } from 'zod';

// 初始化 OpenAI 客户端
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     baseURL: process.env.OPENAI_BASE_URL,
// })

// 最大响应时间，单位秒
export const maxDuration = 15

export async function POST(request: Request) {
    try { 
        const { messages, system }: { messages: UIMessage[], system?: string } = await request.json();
        // 初始化 OpenAI 客户端
        // generateText 一次性返回完整结果，streamText 则是流式返回增量结果
        const result  = streamText({
            model: deepseek('deepseek-v4-flash'),
            messages: await convertToModelMessages(messages),
            // messages: messages,
            system: system || `你是我的人工智能助手，协助我解答问题和提供信息。请尽可能详细地回答我的问题，并提供相关的背景信息和示例来支持你的回答。如果你不确定某个问题的答案，请诚实地告诉我，并尽量提供相关的信息或建议。
            `,
            tools: {
                // 工具1：获取当前时间（无参数）
                get_current_time: tool({
                    description: '获取当前日期和时间（北京时间）',
                    inputSchema: z.object({
                        // code: z.string()
                    }),
                    execute: async () => {
                        return new Date().toLocaleString('zh-CN');
                    },
                }),
                // 工具2：查询天气（需要城市参数）
                get_weather: tool({
                            description: '查询指定城市的天气',
                            inputSchema: z.object({
                                city: z.string().describe('城市名称，例如北京、上海'),
                            }),
                            execute: async ({ city }) => {
                                // 这里是模拟数据，实际可调用真实天气API
                                await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟
                                const weatherMap: Record<string, string> = {
                                    北京: '晴天 25°C',
                                    上海: '多云 22°C',
                                    深圳: '阵雨 28°C',
                                };
                                return weatherMap[city] || `${city}：晴 20°C（模拟数据）`;
                            },
                }),
            },
            // stopWhen: stepCountIs(1)
        })
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('Error in chat route:', error)
        return NextResponse.json({ error: 'An error occurred while processing the request.' }, { status: 500 })
    }
}