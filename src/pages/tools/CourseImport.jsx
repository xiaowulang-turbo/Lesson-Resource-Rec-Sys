import { useState } from 'react'
import toast from 'react-hot-toast'

function CourseImport() {
    const [isUploading, setIsUploading] = useState(false)
    const [courseInfo, setCourseInfo] = useState({
        courseId: '',
        courseName: '',
        courseCode: '',
        semester: '',
        instructor: '',
        subject: '计算机科学',
        grade: '本科',
        difficulty: 2,
    })
    const [selectedFiles, setSelectedFiles] = useState([])
    const [uploadResults, setUploadResults] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setCourseInfo((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        setSelectedFiles(files)

        // 显示选中的文件列表
        if (files.length > 0) {
            console.log(
                '选中的文件:',
                files.map((f) => f.name)
            )
        }
    }

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error('请选择要上传的文件')
            return
        }

        if (!courseInfo.courseId || !courseInfo.courseName) {
            toast.error('请填写课程基本信息')
            return
        }

        setIsUploading(true)

        try {
            const formData = new FormData()

            // 添加课程信息
            Object.keys(courseInfo).forEach((key) => {
                formData.append(key, courseInfo[key])
            })

            // 添加文件
            selectedFiles.forEach((file) => {
                formData.append('files', file)
            })

            const response = await fetch('/api/course-import/upload-multiple', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })

            const result = await response.json()

            if (response.ok) {
                setUploadResults(result.data)
                toast.success(`成功上传 ${result.data.successCount} 个文件！`)

                // 清空文件选择
                setSelectedFiles([])
                document.getElementById('file-input').value = ''
            } else {
                toast.error(result.message || '上传失败')
            }
        } catch (error) {
            console.error('上传错误:', error)
            toast.error('上传过程中发生错误')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    📚 课程文件批量上传
                </h1>

                {/* 课程信息表单 */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        课程基本信息
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                课程ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="courseId"
                                value={courseInfo.courseId}
                                onChange={handleInputChange}
                                placeholder="如: CS401_2024_Spring"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                课程名称 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="courseName"
                                value={courseInfo.courseName}
                                onChange={handleInputChange}
                                placeholder="如: 软件工程"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                课程代码
                            </label>
                            <input
                                type="text"
                                name="courseCode"
                                value={courseInfo.courseCode}
                                onChange={handleInputChange}
                                placeholder="如: CS401"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                学期
                            </label>
                            <input
                                type="text"
                                name="semester"
                                value={courseInfo.semester}
                                onChange={handleInputChange}
                                placeholder="如: 2024春季"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                授课教师
                            </label>
                            <input
                                type="text"
                                name="instructor"
                                value={courseInfo.instructor}
                                onChange={handleInputChange}
                                placeholder="如: 张教授"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                学科
                            </label>
                            <select
                                name="subject"
                                value={courseInfo.subject}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="计算机科学">计算机科学</option>
                                <option value="数学">数学</option>
                                <option value="物理">物理</option>
                                <option value="化学">化学</option>
                                <option value="生物">生物</option>
                                <option value="其他">其他</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                年级
                            </label>
                            <select
                                name="grade"
                                value={courseInfo.grade}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="本科一年级">本科一年级</option>
                                <option value="本科二年级">本科二年级</option>
                                <option value="本科三年级">本科三年级</option>
                                <option value="本科四年级">本科四年级</option>
                                <option value="研究生">研究生</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                难度等级 (1-5)
                            </label>
                            <select
                                name="difficulty"
                                value={courseInfo.difficulty}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={1}>1 - 简单</option>
                                <option value={2}>2 - 较简单</option>
                                <option value={3}>3 - 中等</option>
                                <option value={4}>4 - 较难</option>
                                <option value={5}>5 - 困难</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 文件选择 */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        选择课程文件
                    </h2>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                            id="file-input"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.mp3,.wav,.jpg,.jpeg,.png,.gif,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <label
                            htmlFor="file-input"
                            className="cursor-pointer inline-flex flex-col items-center"
                        >
                            <svg
                                className="w-8 h-8 text-gray-400 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <span className="text-gray-600">
                                点击选择文件或拖拽文件到此处
                            </span>
                            <span className="text-sm text-gray-400 mt-1">
                                支持: PDF, DOC, DOCX, PPT, PPTX, MP4, AVI, MOV,
                                MP3, WAV, 图片等
                            </span>
                        </label>
                    </div>

                    {/* 显示选中的文件 */}
                    {selectedFiles.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                已选择 {selectedFiles.length} 个文件:
                            </h3>
                            <div className="max-h-40 overflow-y-auto">
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded mb-1"
                                    >
                                        <span className="text-sm text-gray-700 truncate">
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(
                                                2
                                            )}{' '}
                                            MB
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 文件命名规范说明 */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">
                        📝 文件命名规范 (可自动识别章节)
                    </h3>
                    <div className="text-sm text-blue-700 space-y-1">
                        <p>
                            • <strong>推荐格式：</strong>
                            第1章-软件工程概述-第1节-基本概念.pptx
                        </p>
                        <p>
                            • <strong>简化格式：</strong>第2章-软件生命周期.pdf
                        </p>
                        <p>
                            • <strong>数字格式：</strong>1-1-软件工程基础.docx
                        </p>
                        <p>
                            • <strong>普通格式：</strong>软件工程课件.pptx
                            (不会自动识别章节)
                        </p>
                    </div>
                </div>

                {/* 上传按钮 */}
                <div className="flex justify-center">
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || selectedFiles.length === 0}
                        className={`px-6 py-3 rounded-lg text-white font-medium ${
                            isUploading || selectedFiles.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                        }`}
                    >
                        {isUploading ? (
                            <span className="flex items-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                正在上传...
                            </span>
                        ) : (
                            `🚀 开始上传 (${selectedFiles.length} 个文件)`
                        )}
                    </button>
                </div>

                {/* 上传结果 */}
                {uploadResults && (
                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800 mb-3">
                            📊 上传结果
                        </h3>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {uploadResults.totalFiles}
                                </div>
                                <div className="text-sm text-gray-600">
                                    总文件数
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {uploadResults.successCount}
                                </div>
                                <div className="text-sm text-gray-600">
                                    成功上传
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {uploadResults.errorCount}
                                </div>
                                <div className="text-sm text-gray-600">
                                    上传失败
                                </div>
                            </div>
                        </div>

                        {uploadResults.errors &&
                            uploadResults.errors.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-red-800 mb-2">
                                        失败的文件:
                                    </h4>
                                    {uploadResults.errors.map(
                                        (error, index) => (
                                            <div
                                                key={index}
                                                className="text-sm text-red-700 mb-1"
                                            >
                                                • {error.file}: {error.error}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CourseImport
