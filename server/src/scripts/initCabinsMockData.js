import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// 获取当前文件的目录路径
const __dirname = dirname(fileURLToPath(import.meta.url))

// 加载环境变量
dotenv.config({ path: join(__dirname, '../../.env') })

// 定义Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'user'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

const cabinSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    maxCapacity: {
        type: Number,
        required: true,
    },
    regularPrice: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    description: String,
    image: String,
})

const bookingSchema = new mongoose.Schema({
    cabinId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cabin',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    numNights: {
        type: Number,
        required: true,
    },
    numGuests: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['unconfirmed', 'confirmed', 'checked-in', 'checked-out'],
        default: 'unconfirmed',
    },
    hasBreakfast: {
        type: Boolean,
        default: false,
    },
    observations: String,
    isPaid: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

// 创建模型
const User = mongoose.model('User', userSchema)
const Cabin = mongoose.model('Cabin', cabinSchema)
const Booking = mongoose.model('Booking', bookingSchema)

// Mock数据
const mockUsers = [
    {
        name: '管理员',
        email: 'admin@example.com',
        password:
            '$2a$12$sWSdI13BJ5ipPca/f8KTF.k4eFKsUtobfWdTBoQdj9g8H5koBZk4e', // password123
        role: 'admin',
    },
    {
        name: '教师',
        email: 'teacher@example.com',
        password:
            '$2a$12$sWSdI13BJ5ipPca/f8KTF.k4eFKsUtobfWdTBoQdj9g8H5koBZk4e',
        role: 'teacher',
    },
    {
        name: '学生',
        email: 'student@example.com',
        password:
            '$2a$12$sWSdI13BJ5ipPca/f8KTF.k4eFKsUtobfWdTBoQdj9g8H5koBZk4e',
        role: 'user',
    },
    {
        name: 'jonas',
        email: 'jonas@example.com',
        password:
            '$2a$12$sWSdI13BJ5ipPca/f8KTF.k4eFKsUtobfWdTBoQdj9g8H5koBZk4e', // password123
        role: 'admin',
    },
]

const mockCabins = [
    {
        name: '001号小木屋',
        maxCapacity: 2,
        regularPrice: 250,
        discount: 0,
        description: '舒适的双人间，配备基本设施',
        image: 'https://example.com/cabin-001.jpg',
    },
    {
        name: '002号豪华套房',
        maxCapacity: 4,
        regularPrice: 500,
        discount: 50,
        description: '豪华四人套房，含独立卫浴和厨房',
        image: 'https://example.com/cabin-002.jpg',
    },
    {
        name: '003号家庭别墅',
        maxCapacity: 6,
        regularPrice: 800,
        discount: 100,
        description: '独栋别墅，适合家庭入住',
        image: 'https://example.com/cabin-003.jpg',
    },
]

// 连接数据库
mongoose
    .connect(
        process.env.MONGODB_URI ||
            'mongodb://localhost:27017/lesson-resource-db'
    )
    .then(() => console.log('数据库连接成功'))
    .catch((err) => console.error('数据库连接失败:', err))

// 初始化数据
const initMockData = async () => {
    try {
        // 清除现有数据
        await User.deleteMany({})
        await Cabin.deleteMany({})
        await Booking.deleteMany({})

        // 创建用户
        const users = await User.create(mockUsers)
        console.log('Mock用户创建成功')

        // 创建小木屋
        const cabins = await Cabin.create(mockCabins)
        console.log('Mock小木屋创建成功')

        // 创建预订
        const mockBookings = []
        const startDate = new Date()

        for (let i = 0; i < 5; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)]
            const randomCabin =
                cabins[Math.floor(Math.random() * cabins.length)]
            const numNights = Math.floor(Math.random() * 5) + 1

            const booking = {
                cabinId: randomCabin._id,
                userId: randomUser._id,
                startDate: new Date(
                    startDate.getTime() + i * 24 * 60 * 60 * 1000
                ),
                endDate: new Date(
                    startDate.getTime() + (i + numNights) * 24 * 60 * 60 * 1000
                ),
                numNights,
                numGuests:
                    Math.floor(Math.random() * randomCabin.maxCapacity) + 1,
                totalPrice: randomCabin.regularPrice * numNights,
                status: ['unconfirmed', 'confirmed', 'checked-in'][
                    Math.floor(Math.random() * 3)
                ],
                hasBreakfast: Math.random() > 0.5,
                observations: '无特殊要求',
                isPaid: Math.random() > 0.3,
            }
            mockBookings.push(booking)
        }

        await Booking.create(mockBookings)
        console.log('Mock预订创建成功')

        console.log('所有Mock数据初始化完成！')
        console.log('\n测试账号信息：')
        console.log('管理员 - Email: admin@example.com, 密码: password123')
        console.log('教师 - Email: teacher@example.com, 密码: password123')
        console.log('学生 - Email: student@example.com, 密码: password123\n')
    } catch (error) {
        console.error('Mock数据初始化失败:', error)
    } finally {
        mongoose.connection.close()
    }
}

initMockData()
