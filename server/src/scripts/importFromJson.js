import path from 'path'
import { fileURLToPath } from 'url'
import { importFromJsonFile } from './importMusicResources.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 解析命令行参数
const getFilePath = () => {
    const args = process.argv.slice(2)
    let filePath = null

    args.forEach((arg) => {
        if (arg.startsWith('--file=')) {
            filePath = arg.split('=')[1]
        }
    })

    if (!filePath) {
        console.error(
            '❌ 错误: 请提供文件路径，例如: node importFromJson.js --file=music_resources_123456789.json'
        )
        process.exit(1)
    }

    // 如果是相对路径，转换为绝对路径
    if (!path.isAbsolute(filePath)) {
        filePath = path.join(__dirname, '../../../exports', filePath)
    }

    return filePath
}

// 主函数
const main = async () => {
    const filePath = getFilePath()
    console.log(`🔄 准备从文件导入: ${filePath}`)
    await importFromJsonFile(filePath)
}

// 执行
main().catch((error) => {
    console.error('❌ 导入过程中出错:', error)
    process.exit(1)
})
