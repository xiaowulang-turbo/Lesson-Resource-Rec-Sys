/**
 * Redis缓存服务
 * 用于缓存推荐结果，减少重复计算
 */
import { createClient } from 'redis'

class RedisCacheService {
    constructor(ttl = 3600) {
        // 默认缓存有效期1小时（秒为单位）
        this.defaultTTL = process.env.REDIS_TTL
            ? parseInt(process.env.REDIS_TTL)
            : ttl
        this.client = null
        this.isConnected = false
        this.prefix = 'recomm:'
        this.isConnecting = false
        this.reconnectTimer = null
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 10
        this.reconnectDelay = 5000 // 初始重连延迟5秒
        this.initialize()
    }

    /**
     * 初始化Redis连接
     */
    async initialize() {
        if (this.isConnecting) {
            return
        }

        this.isConnecting = true

        try {
            this.client = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > this.maxReconnectAttempts) {
                            console.error(
                                `[RedisCacheService] 达到最大重连次数 ${this.maxReconnectAttempts}，停止重连`
                            )
                            return new Error('超过最大重连尝试次数')
                        }

                        // 指数退避策略，最长等待60秒
                        const delay = Math.min(
                            Math.pow(2, retries) * this.reconnectDelay,
                            60000
                        )
                        console.log(
                            `[RedisCacheService] 尝试重连(${retries})，延迟 ${delay}ms`
                        )
                        return delay
                    },
                },
            })

            this.client.on('error', (error) => {
                console.error(`[RedisCacheService] 连接错误: ${error}`)
                this.isConnected = false

                // 如果不是连接中，且没有重连计时器，则尝试重连
                if (!this.isConnecting && !this.reconnectTimer) {
                    this.scheduleReconnect()
                }
            })

            this.client.on('connect', () => {
                console.log('[RedisCacheService] 已连接到Redis服务器')
            })

            this.client.on('ready', () => {
                console.log('[RedisCacheService] Redis服务器就绪')
                this.isConnected = true
                this.isConnecting = false
                this.reconnectAttempts = 0

                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer)
                    this.reconnectTimer = null
                }
            })

            this.client.on('end', () => {
                console.log('[RedisCacheService] Redis连接已断开')
                this.isConnected = false

                // 连接终止时尝试重连
                if (!this.isConnecting && !this.reconnectTimer) {
                    this.scheduleReconnect()
                }
            })

            await this.client.connect()
        } catch (error) {
            console.error(`[RedisCacheService] 初始化错误: ${error}`)
            this.isConnected = false
            this.isConnecting = false

            // 初始连接失败时，自动尝试重连
            this.scheduleReconnect()
        }
    }

    /**
     * 安排重新连接
     */
    scheduleReconnect() {
        // 防止多个重连计时器
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
        }

        this.reconnectAttempts++

        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            console.error(
                `[RedisCacheService] 达到最大重连次数 ${this.maxReconnectAttempts}，停止重连`
            )
            return
        }

        // 指数退避策略，最长等待60秒
        const delay = Math.min(
            Math.pow(2, this.reconnectAttempts - 1) * this.reconnectDelay,
            60000
        )

        console.log(
            `[RedisCacheService] 安排重连(${this.reconnectAttempts})，延迟 ${delay}ms`
        )

        this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = null
            console.log(`[RedisCacheService] 尝试重连...`)
            await this.initialize()
        }, delay)
    }

    /**
     * 生成缓存键
     * @param {String} prefix 键前缀
     * @param {Object} params 参数对象
     * @returns {String} 缓存键
     */
    generateKey(prefix, params) {
        const paramsString = JSON.stringify(params)
        return `${this.prefix}${prefix}_${paramsString}`
    }

    /**
     * 设置缓存
     * @param {String} key 缓存键
     * @param {*} value 缓存值
     * @param {Number} ttl 过期时间(秒)，默认使用构造函数中的值
     */
    async set(key, value, ttl = this.defaultTTL) {
        if (!this.isConnected) {
            console.warn('[RedisCacheService] Redis未连接，无法设置缓存')
            return value
        }

        try {
            const stringValue = JSON.stringify(value)
            await this.client.set(key, stringValue, { EX: ttl })

            const expiresAt = new Date(Date.now() + ttl * 1000)
            console.log(
                `[RedisCacheService] 缓存已设置: ${key}, 过期时间: ${expiresAt.toLocaleString()}`
            )
            return value
        } catch (error) {
            console.error(`[RedisCacheService] 设置缓存失败: ${error}`)
            return value
        }
    }

    /**
     * 获取缓存
     * @param {String} key 缓存键
     * @returns {*} 缓存值或undefined(如果缓存不存在或已过期)
     */
    async get(key) {
        if (!this.isConnected) {
            console.warn('[RedisCacheService] Redis未连接，无法获取缓存')
            return undefined
        }

        try {
            const value = await this.client.get(key)

            if (!value) {
                console.log(`[RedisCacheService] 缓存未命中: ${key}`)
                return undefined
            }

            console.log(`[RedisCacheService] 缓存命中: ${key}`)
            return JSON.parse(value)
        } catch (error) {
            console.error(`[RedisCacheService] 获取缓存失败: ${error}`)
            return undefined
        }
    }

    /**
     * 删除缓存
     * @param {String} key 缓存键
     */
    async delete(key) {
        if (!this.isConnected) {
            console.warn('[RedisCacheService] Redis未连接，无法删除缓存')
            return
        }

        try {
            await this.client.del(key)
            console.log(`[RedisCacheService] 缓存已删除: ${key}`)
        } catch (error) {
            console.error(`[RedisCacheService] 删除缓存失败: ${error}`)
        }
    }

    /**
     * 清除所有缓存
     */
    async clear() {
        if (!this.isConnected) {
            console.warn('[RedisCacheService] Redis未连接，无法清除缓存')
            return
        }

        try {
            // 使用通配符匹配所有缓存前缀的键
            const keys = await this.client.keys(`${this.prefix}*`)

            if (keys.length > 0) {
                await this.client.del(keys)
                console.log(`[RedisCacheService] 已清除 ${keys.length} 条缓存`)
            } else {
                console.log(`[RedisCacheService] 没有缓存需要清除`)
            }
        } catch (error) {
            console.error(`[RedisCacheService] 清除缓存失败: ${error}`)
        }
    }

    /**
     * 获取缓存统计信息
     * @returns {Object} 缓存统计信息
     */
    async getStats() {
        if (!this.isConnected) {
            console.warn('[RedisCacheService] Redis未连接，无法获取统计信息')
            return { total: 0, active: 0, expired: 0 }
        }

        try {
            const keys = await this.client.keys(`${this.prefix}*`)
            return {
                total: keys.length,
                active: keys.length, // Redis会自动移除过期键，所以active等于total
                expired: 0,
                isConnected: this.isConnected,
            }
        } catch (error) {
            console.error(`[RedisCacheService] 获取统计信息失败: ${error}`)
            return {
                total: 0,
                active: 0,
                expired: 0,
                isConnected: this.isConnected,
                error: error.message,
            }
        }
    }

    /**
     * 清理过期缓存（Redis会自动处理，此方法仅为保持API兼容）
     * @returns {Number} 清理的缓存数量
     */
    async cleanup() {
        // Redis自动清理过期键，不需要手动操作
        console.log(`[RedisCacheService] Redis会自动清理过期缓存`)
        return 0
    }

    /**
     * 关闭Redis连接
     */
    async close() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this.client && this.isConnected) {
            try {
                await this.client.quit()
                console.log('[RedisCacheService] Redis连接已关闭')
            } catch (error) {
                console.error(
                    `[RedisCacheService] 关闭Redis连接时出错: ${error}`
                )
            } finally {
                this.isConnected = false
            }
        }
    }
}

// 创建单例实例
const redisCacheService = new RedisCacheService()

export default redisCacheService
