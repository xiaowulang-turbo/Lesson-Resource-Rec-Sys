/**
 * 数据服务接口定义
 * 所有数据服务适配器都需要实现这个接口
 */
export class DataServiceInterface {
    // 用户相关
    async createUser(userData) {
        throw new Error('Not implemented')
    }
    async getUserById(id) {
        throw new Error('Not implemented')
    }
    async getUserByEmail(email) {
        throw new Error('Not implemented')
    }
    async updateUser(id, userData) {
        throw new Error('Not implemented')
    }
    async deleteUser(id) {
        throw new Error('Not implemented')
    }

    // 账户相关
    async createAccount(accountData) {
        throw new Error('Not implemented')
    }
    async getAccountById(id) {
        throw new Error('Not implemented')
    }
    async getAccountByEmail(email) {
        throw new Error('Not implemented')
    }
    async updateAccount(id, accountData) {
        throw new Error('Not implemented')
    }
    async deleteAccount(id) {
        throw new Error('Not implemented')
    }
    async createUserWithAccount(userData, accountData) {
        throw new Error('Not implemented')
    }

    // 资源相关
    async createResource(resourceData) {
        throw new Error('Not implemented')
    }
    async getResourceById(id) {
        throw new Error('Not implemented')
    }
    async getAllResources(filters = {}) {
        throw new Error('Not implemented')
    }
    async updateResource(id, resourceData) {
        throw new Error('Not implemented')
    }
    async deleteResource(id) {
        throw new Error('Not implemented')
    }
    async addResourceRating(resourceId, ratingData) {
        throw new Error('Not implemented')
    }

    // 认证相关
    async validateCredentials(email, password) {
        throw new Error('Not implemented')
    }
    async generateAuthToken(userId) {
        throw new Error('Not implemented')
    }
    async verifyAuthToken(token) {
        throw new Error('Not implemented')
    }
}
