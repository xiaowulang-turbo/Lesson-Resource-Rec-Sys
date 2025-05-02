/**
 * 简单的内存缓存服务
 * 用于缓存推荐结果，减少重复计算
 */
class CacheService {
    constructor(ttl = 3600000) {
        // 默认缓存有效期1小时
        this.cache = new Map()
        this.defaultTTL = ttl
    }

    /**
     * 生成缓存键
     * @param {String} prefix 键前缀
     * @param {Object} params 参数对象
     * @returns {String} 缓存键
     */
    generateKey(prefix, params) {
        const paramsString = JSON.stringify(params)
        return `${prefix}_${paramsString}`
    }

    /**
     * 设置缓存
     * @param {String} key 缓存键
     * @param {*} value 缓存值
     * @param {Number} ttl 过期时间(毫秒)，默认使用构造函数中的值
     */
    set(key, value, ttl = this.defaultTTL) {
        const expiresAt = Date.now() + ttl
        this.cache.set(key, {
            value,
            expiresAt,
        })

        console.log(
            `[CacheService] 缓存已设置: ${key}, 过期时间: ${new Date(
                expiresAt
            ).toLocaleString()}`
        )
        return value
    }

    /**
     * 获取缓存
     * @param {String} key 缓存键
     * @returns {*} 缓存值或undefined(如果缓存不存在或已过期)
     */
    get(key) {
        const cached = this.cache.get(key)

        // 缓存不存在
        if (!cached) {
            console.log(`[CacheService] 缓存未命中: ${key}`)
            return undefined
        }

        // 缓存已过期
        if (cached.expiresAt < Date.now()) {
            console.log(`[CacheService] 缓存已过期: ${key}`)
            this.cache.delete(key)
            return undefined
        }

        console.log(`[CacheService] 缓存命中: ${key}`)
        return cached.value
    }

    /**
     * 删除缓存
     * @param {String} key 缓存键
     */
    delete(key) {
        this.cache.delete(key)
        console.log(`[CacheService] 缓存已删除: ${key}`)
    }

    /**
     * 清除所有缓存
     */
    clear() {
        this.cache.clear()
        console.log(`[CacheService] 所有缓存已清除`)
    }

    /**
     * 获取缓存统计信息
     * @returns {Object} 缓存统计信息
     */
    getStats() {
        const now = Date.now()
        let total = 0
        let expired = 0

        this.cache.forEach((item) => {
            total++
            if (item.expiresAt < now) {
                expired++
            }
        })

        return {
            total,
            active: total - expired,
            expired,
        }
    }

    /**
     * 清理过期缓存
     * @returns {Number} 清理的缓存数量
     */
    cleanup() {
        const now = Date.now()
        let count = 0

        for (const [key, item] of this.cache.entries()) {
            if (item.expiresAt < now) {
                this.cache.delete(key)
                count++
            }
        }

        console.log(`[CacheService] 已清理 ${count} 条过期缓存`)
        return count
    }
}

// 创建单例实例
const cacheService = new CacheService()

export default cacheService
