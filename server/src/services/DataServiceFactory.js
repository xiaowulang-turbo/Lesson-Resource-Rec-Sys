import { MongoDBAdapter } from './adapters/MongoDBAdapter.js'

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
