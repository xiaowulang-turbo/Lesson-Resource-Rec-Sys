import Resource from '../models/resourceModel.js'

/**
 * 搜索资源
 */
export const searchResources = async (req, res) => {
    try {
        const { q: query } = req.query

        if (!query) {
            return res.status(400).json({
                status: 'fail',
                message: '请提供搜索关键词',
            })
        }

        // 使用MongoDB的文本搜索功能
        const resources = await Resource.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(50) // 限制结果数量

        // 如果文本搜索没有结果，尝试使用正则表达式搜索标题和描述
        if (resources.length === 0) {
            const regexResources = await Resource.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { highlightContent: { $regex: query, $options: 'i' } },
                ],
            }).limit(50)

            return res.status(200).json({
                status: 'success',
                results: regexResources.length,
                data: {
                    resources: regexResources,
                },
            })
        }

        res.status(200).json({
            status: 'success',
            results: resources.length,
            data: {
                resources,
            },
        })
    } catch (err) {
        console.error('搜索资源失败:', err)
        res.status(400).json({
            status: 'fail',
            message: err.message || '搜索资源失败',
        })
    }
}
