import { MongoDBAdapter } from './adapters/MongoDBAdapter.js'
import { SupabaseAdapter } from './adapters/SupabaseAdapter.js'

export class DataServiceFactory {
    static #instance = null
    #adapter = null

    constructor() {
        if (DataServiceFactory.#instance) {
            return DataServiceFactory.#instance
        }
        DataServiceFactory.#instance = this
    }

    initialize(type = process.env.DATA_SERVICE_TYPE || 'mongodb') {
        switch (type.toLowerCase()) {
            case 'supabase':
                this.#adapter = new SupabaseAdapter()
                break
            case 'mongodb':
            default:
                this.#adapter = new MongoDBAdapter()
                break
        }
    }

    getAdapter() {
        if (!this.#adapter) {
            this.initialize()
        }
        return this.#adapter
    }
}
