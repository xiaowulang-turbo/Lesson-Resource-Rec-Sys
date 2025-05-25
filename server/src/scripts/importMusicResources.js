import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Resource from '../models/resourceModel.js'
import User from '../models/userModel.js'
import Account from '../models/accountModel.js'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载配置文件
dotenv.config({ path: path.join(__dirname, '../../../config.env') })

// 辅助函数：提取并清理标签
const extractTags = (tagList) => {
    if (!tagList || !Array.isArray(tagList)) return []
    return tagList.map((tag) => tag[0]).filter((tag) => tag && tag.trim())
}

// 辅助函数：根据标签和描述判断难度等级
const calculateDifficulty = (tags, description) => {
    const text = (tags.join(' ') + ' ' + description).toLowerCase()

    // 简单难度关键词
    if (
        text.includes('轻松') ||
        text.includes('简单') ||
        text.includes('入门') ||
        text.includes('基础')
    ) {
        return 1
    }
    // 高难度关键词
    if (
        text.includes('复杂') ||
        text.includes('高级') ||
        text.includes('专业') ||
        text.includes('深入')
    ) {
        return 4
    }
    // 中等难度关键词
    if (text.includes('中级') || text.includes('进阶')) {
        return 3
    }

    // 默认中等难度
    return 2
}

// 辅助函数：根据音乐类型确定学科
const determineSubject = (tags, name, description) => {
    const text = (tags.join(' ') + ' ' + name + ' ' + description).toLowerCase()

    if (
        text.includes('古典') ||
        text.includes('钢琴') ||
        text.includes('交响') ||
        text.includes('管弦')
    ) {
        return '音乐'
    }
    if (
        text.includes('背景') ||
        text.includes('影视') ||
        text.includes('电影')
    ) {
        return '影视音乐'
    }
    if (
        text.includes('放松') ||
        text.includes('冥想') ||
        text.includes('治疗')
    ) {
        return '音乐治疗'
    }

    return '音乐'
}

// 辅助函数：确定适用年级
const determineGrade = (tags, description) => {
    const text = (tags.join(' ') + ' ' + description).toLowerCase()

    if (
        text.includes('儿童') ||
        text.includes('童谣') ||
        text.includes('简单')
    ) {
        return '小学'
    }
    if (
        text.includes('专业') ||
        text.includes('高级') ||
        text.includes('大师')
    ) {
        return '大学'
    }

    return '通用' // 默认通用年级
}

// 转换音乐数据为资源格式
const convertMusicToResource = (music, defaultUserId) => {
    // 提取和处理数据
    const tags = extractTags(music.tagList || [])
    const subject = determineSubject(
        tags,
        music.name || '',
        music.description || ''
    )
    const grade = determineGrade(tags, music.description || '')
    const difficulty = calculateDifficulty(tags, music.description || '')

    // 创建资源对象
    return {
        // 基本信息
        originalId: music.id?.toString() || '',
        title: music.name || `音乐作品 ${music.id}`,
        description: music.description || music.alt || '暂无描述',

        // 分类信息
        pedagogicalType: 'reference', // 参考资料
        format: 'audio', // 音频格式
        contentType: 'resource', // 资源类型
        subject: subject,
        grade: grade,
        difficulty: difficulty,

        // 资源链接和文件信息
        url: music.sources?.src || '', // 重要：音乐文件链接
        cover: music.sources?.thumbnailUrl || '',

        // 文件详细信息
        fileInfo: {
            format: 'mp3', // 从sources.src可以看出是mp3格式
            duration: music.duration || 0, // 时长（秒）
            size: null, // 文件大小未提供
            lastModified: music.uploadDate
                ? new Date(music.uploadDate)
                : new Date(),
        },

        // 作者和发布信息
        authors: music.user
            ? `${music.user.firstName || ''} ${
                  music.user.lastName || ''
              }`.trim()
            : '',
        publisher: 'Pixabay',
        organization: music.user?.username || '',

        // 创建者信息
        createdBy: defaultUserId,
        createdAt: music.uploadDate ? new Date(music.uploadDate) : new Date(),

        // 标签
        tags: tags,

        // 统计信息
        stats: {
            views: music.viewCount || 0,
            downloads: music.downloadCount || 0,
            favorites: music.likeCount || 0,
            upvotes: 0,
            shares: 0,
        },

        // 权限设置
        access: {
            isPublic: true,
            allowedUsers: [],
            allowedRoles: ['user', 'teacher', 'admin'],
        },

        // 额外的元数据
        metadata: {
            pixabayId: music.id?.toString(),
            mediaType: music.mediaType,
            mediaSubType: music.mediaSubType,
            isAiGenerated: music.isAiGenerated || false,
            rating: music.rating || 0,
            primaryTag: music.primaryTag?.[0] || '',
            downloadUrl: music.sources?.downloadUrl || '',
            waveformUrl: music.sources?.waveformUrl || '',
            hasYoutubeContentId: music.hasYoutubeContentId || false,
            userInfo: JSON.stringify({
                username: music.user?.username,
                userId: music.user?.id,
                followerCount: music.user?.followerCount,
                socialLinks: music.user?.socialLinks,
            }),
        },
    }
}

// 在线导入音乐数据到数据库
const importMusicToDatabase = async (onlineMode = true) => {
    let mongoConnection = null

    try {
        console.log('🚀 开始处理音乐数据导入任务...')
        console.log(`🔧 模式: ${onlineMode ? '在线模式' : '离线模式'}`)

        // 读取temp.json文件
        const tempFilePath = path.join(__dirname, '../../../src/data/temp.json')

        console.log(`📁 查找文件: ${tempFilePath}`)

        if (!fs.existsSync(tempFilePath)) {
            throw new Error(`❌ 找不到文件: ${tempFilePath}`)
        }

        console.log('📖 读取temp.json文件...')
        const fileContent = fs.readFileSync(tempFilePath, 'utf8')
        console.log(`📊 文件大小: ${fileContent.length} 字节`)

        const tempData = JSON.parse(fileContent)
        console.log('✅ JSON解析成功')

        const musicResults = tempData.page?.results || []

        if (musicResults.length === 0) {
            throw new Error('❌ temp.json文件中没有找到音乐数据')
        }

        console.log(`📁 找到 ${musicResults.length} 个音乐资源`)
        console.log(
            `🔍 第一个资源示例: ${JSON.stringify(
                musicResults[0].name || musicResults[0].id
            )}`
        )

        // 在线模式：连接数据库并保存
        if (onlineMode) {
            // 检查环境变量
            if (!process.env.MONGODB_URI) {
                throw new Error('❌ 未找到 MONGODB_URI 环境变量')
            }

            console.log('🔗 尝试连接数据库...')
            console.log(
                `📍 数据库地址: ${process.env.MONGODB_URI.replace(
                    /\/\/.*@/,
                    '//***@'
                )}`
            )

            // 连接数据库
            mongoConnection = await mongoose.connect(process.env.MONGODB_URI)
            console.log('✅ 已连接到 MongoDB')

            // 查找或创建一个默认用户作为资源创建者
            console.log('👤 查找或创建默认用户...')
            let defaultUser = await User.findOne().populate('account')

            if (!defaultUser) {
                console.log('🔨 创建默认账户和用户...')
                // 创建默认账户和用户
                const defaultAccount = await Account.create({
                    email: 'music.importer@system.com',
                    password: 'password123',
                    name: '音乐资源导入系统',
                    role: 'admin',
                    active: true,
                })

                defaultUser = await User.create({
                    name: '音乐资源导入系统',
                    accountId: defaultAccount._id,
                    preferences: {
                        preferredSubjects: ['音乐'],
                        preferredGrades: ['通用'],
                        preferredDifficulty: '中级',
                    },
                })

                console.log('✅ 创建了默认用户作为音乐资源创建者')
            }

            console.log(`👤 使用用户: ${defaultUser.name} 作为资源创建者`)

            // 转换并保存音乐数据
            let successCount = 0
            let skipCount = 0
            let errorCount = 0

            console.log('🎵 开始导入音乐资源...')

            for (let i = 0; i < musicResults.length; i++) {
                const music = musicResults[i]

                try {
                    console.log(
                        `\n[${i + 1}/${musicResults.length}] 处理: ${
                            music.name || music.id
                        }`
                    )

                    // 检查是否已存在（基于originalId）
                    const existingResource = await Resource.findOne({
                        originalId: music.id?.toString(),
                    })

                    if (existingResource) {
                        console.log(`⏭️  跳过已存在的资源: ${music.name}`)
                        skipCount++
                        continue
                    }

                    // 转换为资源格式
                    const resourceData = convertMusicToResource(
                        music,
                        defaultUser._id
                    )

                    // 保存到数据库
                    const resource = new Resource(resourceData)
                    await resource.save()

                    console.log(
                        `✅ 成功导入: ${resource.title} (${resource.fileInfo.duration}秒)`
                    )
                    console.log(`   🔗 音频链接: ${resource.url}`)
                    successCount++
                } catch (error) {
                    console.error(
                        `❌ 导入失败 - ${music.name}: ${error.message}`
                    )
                    if (error.message.includes('validation')) {
                        console.error('   验证错误详情:', error.errors)
                    }
                    errorCount++
                }
            }

            // 输出统计结果
            console.log('\n📊 导入统计:')
            console.log(`✅ 成功导入: ${successCount} 个音乐资源`)
            console.log(`⏭️  跳过重复: ${skipCount} 个`)
            console.log(`❌ 导入失败: ${errorCount} 个`)
            console.log(`📁 总共处理: ${musicResults.length} 个`)

            // 验证导入结果
            const totalMusicResources = await Resource.countDocuments({
                format: 'audio',
            })
            console.log(`🎵 数据库中现有音乐资源总数: ${totalMusicResources}`)

            // 显示一些导入的资源示例
            const sampleResources = await Resource.find({ format: 'audio' })
                .sort({ createdAt: -1 })
                .limit(3)
                .select('title url fileInfo.duration stats.views')

            console.log('\n🎵 最新导入的音乐资源示例:')
            sampleResources.forEach((resource, index) => {
                console.log(`${index + 1}. ${resource.title}`)
                console.log(`   🔗 链接: ${resource.url}`)
                console.log(`   ⏱️  时长: ${resource.fileInfo.duration}秒`)
                console.log(`   👀 浏览量: ${resource.stats.views}`)
                console.log('')
            })
        }
        // 离线模式：生成JSON文件供以后导入
        else {
            console.log('📝 离线模式：生成JSON导入文件...')

            // 模拟一个用户ID用于离线文件
            const mockUserId = '5ffdf41a1a2b10a2a99fffff'

            // 转换所有音乐数据为资源格式
            const resources = musicResults.map((music) =>
                convertMusicToResource(music, mockUserId)
            )

            // 创建导出目录
            const exportDir = path.join(__dirname, '../../../exports')
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true })
            }

            // 写入JSON文件
            const exportPath = path.join(
                exportDir,
                `music_resources_${Date.now()}.json`
            )
            fs.writeFileSync(exportPath, JSON.stringify(resources, null, 2))

            console.log(`✅ 成功生成资源导入文件: ${exportPath}`)
            console.log(`📊 共转换 ${resources.length} 个音乐资源`)

            // 提供导入说明
            console.log('\n📋 导入说明:')
            console.log('1. 将此文件复制到MongoDB支持的服务器上')
            console.log('2. 使用mongoimport工具导入数据:')
            console.log(
                `   mongoimport --db yourDatabaseName --collection resources --file ${path.basename(
                    exportPath
                )} --jsonArray`
            )
            console.log('3. 或者使用以下命令在连接数据库后导入:')
            console.log(
                '   node importFromJson.js --file=' + path.basename(exportPath)
            )
        }
    } catch (error) {
        console.error('❌ 音乐数据处理失败:', error.message)
        if (error.stack) {
            console.error('错误堆栈:', error.stack)
        }
    } finally {
        if (mongoConnection && mongoConnection.connection.readyState === 1) {
            await mongoose.connection.close()
            console.log('🔒 数据库连接已关闭')
        }
    }
}

// 从JSON文件导入资源
const importFromJsonFile = async (filePath) => {
    try {
        // 检查环境变量
        if (!process.env.MONGODB_URI) {
            throw new Error('❌ 未找到 MONGODB_URI 环境变量')
        }

        console.log('🔗 尝试连接数据库...')
        console.log(`📍 数据库地址: ${process.env.MONGODB_URI}`)

        // 连接数据库
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ 已连接到 MongoDB')

        // 查找默认用户
        console.log('👤 查找默认用户...')
        const defaultUser = await User.findOne()

        if (!defaultUser) {
            throw new Error('❌ 没有找到可用的用户，请先创建一个用户')
        }

        // 读取JSON文件
        console.log(`📖 读取文件: ${filePath}`)
        if (!fs.existsSync(filePath)) {
            throw new Error(`❌ 找不到文件: ${filePath}`)
        }

        const resources = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        if (!Array.isArray(resources) || resources.length === 0) {
            throw new Error('❌ 文件中没有有效的资源数据')
        }

        console.log(`📁 找到 ${resources.length} 个资源`)

        // 开始导入
        let successCount = 0
        let skipCount = 0
        let errorCount = 0

        for (let i = 0; i < resources.length; i++) {
            const resource = resources[i]

            try {
                console.log(
                    `\n[${i + 1}/${resources.length}] 处理: ${resource.title}`
                )

                // 检查是否已存在
                const existingResource = await Resource.findOne({
                    originalId: resource.originalId,
                })

                if (existingResource) {
                    console.log(`⏭️  跳过已存在的资源: ${resource.title}`)
                    skipCount++
                    continue
                }

                // 更新createdBy为实际用户ID
                resource.createdBy = defaultUser._id

                // 保存到数据库
                const newResource = new Resource(resource)
                await newResource.save()

                console.log(`✅ 成功导入: ${newResource.title}`)
                successCount++
            } catch (error) {
                console.error(
                    `❌ 导入失败 - ${resource.title}: ${error.message}`
                )
                errorCount++
            }
        }

        // 输出统计结果
        console.log('\n📊 导入统计:')
        console.log(`✅ 成功导入: ${successCount} 个资源`)
        console.log(`⏭️  跳过重复: ${skipCount} 个`)
        console.log(`❌ 导入失败: ${errorCount} 个`)
        console.log(`📁 总共处理: ${resources.length} 个`)
    } catch (error) {
        console.error('❌ 导入失败:', error.message)
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close()
            console.log('🔒 数据库连接已关闭')
        }
    }
}

// 解析命令行参数
const parseArgs = () => {
    const args = process.argv.slice(2)
    const options = {
        mode: 'online',
        file: null,
    }

    args.forEach((arg) => {
        if (arg === '--offline') {
            options.mode = 'offline'
        } else if (arg.startsWith('--file=')) {
            options.file = arg.split('=')[1]
            options.mode = 'import-file'
        }
    })

    return options
}

// 主函数
const main = async () => {
    const options = parseArgs()

    if (options.mode === 'import-file' && options.file) {
        console.log('🔄 从JSON文件导入资源...')
        await importFromJsonFile(options.file)
    } else if (options.mode === 'offline') {
        console.log('📄 离线模式：生成导入文件...')
        await importMusicToDatabase(false)
    } else {
        console.log('🌐 在线模式：直接导入数据库...')
        await importMusicToDatabase(true)
    }
}

// 运行脚本
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    console.log('🚀 直接运行脚本...')
    main().catch((error) => {
        console.error('❌ 脚本执行失败:', error)
        process.exit(1)
    })
}

// 导出函数
export { importMusicToDatabase, importFromJsonFile }
