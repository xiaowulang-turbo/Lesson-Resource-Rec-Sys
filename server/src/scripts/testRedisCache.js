/**
 * Redis缓存服务测试脚本
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import redisCacheService from '../services/RedisCacheService.js'

// 获取当前文件的目录路径
const __dirname = dirname(fileURLToPath(import.meta.url))

// 加载环境变量（两级目录向上）
dotenv.config({ path: path.join(__dirname, '../../.env') })

// 等待函数
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 测试Redis缓存服务
async function testRedisCacheService() {
    console.log('开始测试Redis缓存服务...')

    try {
        // 测试连接状态
        console.log('1. 等待Redis连接...')
        await sleep(2000) // 等待连接建立

        // 生成测试键
        const testKey = redisCacheService.generateKey('test', {
            id: 1,
            name: 'test',
        })
        console.log(`2. 生成测试键: ${testKey}`)

        // 设置缓存
        console.log('3. 设置缓存数据...')
        const testData = {
            id: 1,
            name: 'Redis缓存测试',
            timestamp: new Date().toISOString(),
            items: [1, 2, 3, 4, 5],
        }
        await redisCacheService.set(testKey, testData, 60) // 缓存60秒

        // 获取缓存
        console.log('4. 从缓存获取数据...')
        const cachedData = await redisCacheService.get(testKey)
        console.log('缓存数据:', cachedData)

        // 获取缓存统计
        console.log('5. 获取缓存统计...')
        const stats = await redisCacheService.getStats()
        console.log('缓存统计:', stats)

        // 删除缓存
        console.log('6. 删除缓存...')
        await redisCacheService.delete(testKey)

        // 再次获取缓存（确认已删除）
        console.log('7. 再次获取缓存（应为undefined）...')
        const deletedData = await redisCacheService.get(testKey)
        console.log('删除后的缓存数据:', deletedData)

        // 最终获取缓存统计
        console.log('8. 最终缓存统计...')
        const finalStats = await redisCacheService.getStats()
        console.log('最终缓存统计:', finalStats)

        console.log('Redis缓存服务测试完成!')
    } catch (error) {
        console.error('测试过程中出错:', error)
    } finally {
        // 关闭Redis连接
        console.log('关闭Redis连接...')
        await redisCacheService.close()

        // 退出进程
        console.log('测试结束，退出进程')
        process.exit(0)
    }
}

// 运行测试
testRedisCacheService()
