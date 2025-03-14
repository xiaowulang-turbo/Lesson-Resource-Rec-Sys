import { DataServiceInterface } from '../interfaces/DataServiceInterface.js'
import { createClient } from '@supabase/supabase-js'

export class SupabaseAdapter extends DataServiceInterface {
    constructor() {
        super()
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY
        )
    }

    // 用户相关
    async createUser(userData) {
        const { data, error } = await this.supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
        })

        if (error) throw new Error(error.message)

        // 创建用户附加信息
        const { data: profile, error: profileError } = await this.supabase
            .from('profiles')
            .insert([
                {
                    id: data.user.id,
                    name: userData.name,
                    role: userData.role || 'user',
                },
            ])

        if (profileError) throw new Error(profileError.message)

        return {
            id: data.user.id,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'user',
        }
    }

    async getUserById(id) {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single()

        if (error) return null
        return data
    }

    async getUserByEmail(email) {
        const {
            data: { user },
            error,
        } = await this.supabase.auth.admin.getUserByEmail(email)
        if (error || !user) return null

        const { data: profile } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        return {
            id: user.id,
            ...profile,
        }
    }

    async updateUser(id, userData) {
        const { data, error } = await this.supabase
            .from('profiles')
            .update(userData)
            .eq('id', id)
            .select()
            .single()

        if (error) return null
        return data
    }

    async deleteUser(id) {
        const { error } = await this.supabase.auth.admin.deleteUser(id)
        return !error
    }

    // 资源相关
    async createResource(resourceData) {
        const { data, error } = await this.supabase
            .from('resources')
            .insert([resourceData])
            .select()
            .single()

        if (error) throw new Error(error.message)
        return data
    }

    async getResourceById(id) {
        const { data, error } = await this.supabase
            .from('resources')
            .select('*, createdBy:profiles(*)')
            .eq('id', id)
            .single()

        if (error) return null
        return data
    }

    async getAllResources(filters = {}) {
        let query = this.supabase
            .from('resources')
            .select('*, createdBy:profiles(*)')

        // 应用过滤器
        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value)
        })

        const { data, error } = await query
        if (error) return []
        return data
    }

    async updateResource(id, resourceData) {
        const { data, error } = await this.supabase
            .from('resources')
            .update(resourceData)
            .eq('id', id)
            .select('*, createdBy:profiles(*)')
            .single()

        if (error) return null
        return data
    }

    async deleteResource(id) {
        const { error } = await this.supabase
            .from('resources')
            .delete()
            .eq('id', id)

        return !error
    }

    async addResourceRating(resourceId, ratingData) {
        const { data: rating, error: ratingError } = await this.supabase
            .from('ratings')
            .insert([
                {
                    resource_id: resourceId,
                    ...ratingData,
                },
            ])
            .select()
            .single()

        if (ratingError) throw new Error(ratingError.message)

        // 更新资源的平均评分
        const { data: ratings } = await this.supabase
            .from('ratings')
            .select('rating')
            .eq('resource_id', resourceId)

        const averageRating =
            ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length

        const { data: resource } = await this.supabase
            .from('resources')
            .update({ average_rating: averageRating })
            .eq('id', resourceId)
            .select()
            .single()

        return {
            id: resourceId,
            rating: rating,
            averageRating: resource.average_rating,
        }
    }

    // 认证相关
    async validateCredentials(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        })
        return !error && !!data.user
    }

    async generateAuthToken(userId) {
        // Supabase 自动处理 token
        return null
    }

    async verifyAuthToken(token) {
        const {
            data: { user },
            error,
        } = await this.supabase.auth.getUser(token)
        if (error) return null
        return user
    }
}
