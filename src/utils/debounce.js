/**
 * 防抖函数 - 用于延迟执行频繁触发的事件
 * @param {Function} func - 需要防抖的函数
 * @param {number} wait - 等待时间，单位毫秒，默认300ms
 * @param {boolean} immediate - 是否在触发事件后立即执行，默认false（延迟执行）
 * @returns {Function} - 返回防抖处理后的函数
 */
export function debounce(func, wait = 300, immediate = false) {
    let timeout

    const debouncedFunction = function executedFunction(...args) {
        const context = this

        // 定义延迟执行的函数
        const later = function () {
            timeout = null
            if (!immediate) func.apply(context, args)
        }

        // 判断是否立即执行
        const callNow = immediate && !timeout

        // 清除之前的定时器
        clearTimeout(timeout)

        // 设置新的定时器
        timeout = setTimeout(later, wait)

        // 如果需要立即执行，则执行函数
        if (callNow) func.apply(context, args)
    }

    // 添加cancel方法用于取消定时器
    debouncedFunction.cancel = function () {
        clearTimeout(timeout)
        timeout = null
    }

    return debouncedFunction
}

/**
 * 简化版防抖函数 - 仅实现基本防抖功能
 * @param {Function} func - 需要防抖的函数
 * @param {number} delay - 延迟时间，单位毫秒
 * @returns {Function} - 返回防抖处理后的函数
 */
export function simpleDebounce(func, delay = 300) {
    let timer

    const debouncedFunction = function (...args) {
        clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }

    // 添加cancel方法
    debouncedFunction.cancel = function () {
        clearTimeout(timer)
        timer = null
    }

    return debouncedFunction
}

export default debounce
