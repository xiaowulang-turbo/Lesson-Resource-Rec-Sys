import { useState } from 'react'
import styled from 'styled-components'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import Form from '../ui/Form'
import FormRowVertical from '../ui/FormRowVertical'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import FileInput from '../ui/FileInput' // Assuming you have a FileInput component
import Button from '../ui/Button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createResource } from '../services/apiResources'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const UploadPageLayout = styled.div`
    padding: 3.2rem 4.8rem;
`

const FormContainer = styled(Form)`
    /* Add specific styles for the upload form if needed */
    max-width: 80rem;
    margin: 0 auto;
`

const RadioGroup = styled.div`
    display: flex;
    gap: 1.6rem;
    margin-bottom: 1.2rem;

    label {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        cursor: pointer;
    }
`

function Upload() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [uploadType, setUploadType] = useState('file') // 'file' or 'link'
    // Add state for all form fields
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [resourceType, setResourceType] = useState(1) // Default to '文档'
    const [subject, setSubject] = useState('')
    const [grade, setGrade] = useState('')
    const [difficulty, setDifficulty] = useState(3) // Default to '中级'
    const [tags, setTags] = useState('') // Simple comma-separated string for now
    const [file, setFile] = useState(null)
    const [link, setLink] = useState('')
    const [price, setPrice] = useState(0)

    // --- 使用 useMutation 处理表单提交 ---
    const { mutate, isLoading: isCreating } = useMutation({
        mutationFn: createResource, // 指定要调用的 API 函数
        onSuccess: (data) => {
            // 成功回调
            toast.success('新资源上传成功!')
            queryClient.invalidateQueries({ queryKey: ['resources'] }) // 使资源列表查询失效，以便刷新
            // 可选：跳转到新创建的资源页面或资源列表页
            // navigate(`/resources/${data.id}`);
            navigate('/resources')
            // 重置表单 (根据需要实现 reset 函数)
            // reset()
        },
        onError: (err) => {
            // 失败回调
            toast.error(err.message || '上传资源失败')
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (
            (uploadType === 'file' && !file) ||
            (uploadType === 'link' && !link.trim())
        ) {
            toast.error(
                `请${uploadType === 'file' ? '选择文件' : '输入有效的链接'}`
            )
            return
        }
        if (
            !title.trim() ||
            !description.trim() ||
            !subject.trim() ||
            !grade.trim()
        ) {
            toast.error('请填写所有必填项 (标题, 描述, 学科, 年级)')
            return
        }

        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('type', resourceType)
        formData.append('subject', subject)
        formData.append('grade', grade)
        formData.append('difficulty', difficulty)
        // 发送处理后的标签数组
        const tagArray = tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        // FormData 不能直接 append 数组，需要为每个元素 append
        tagArray.forEach((tag) => formData.append('tags[]', tag))
        formData.append('price', price)

        if (uploadType === 'file' && file) {
            formData.append('resourceFile', file)
        } else if (uploadType === 'link') {
            formData.append('url', link.trim())
        }

        // 调用 mutation
        mutate(formData)
    }

    return (
        <UploadPageLayout>
            <Row
                type="horizontal"
                style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2.4rem',
                }}
            >
                <Heading as="h1">上传新资源</Heading>
            </Row>
            <FormContainer
                onSubmit={handleSubmit}
                type={isCreating ? 'disabled' : 'regular'}
            >
                <FormRowVertical label="上传方式">
                    <RadioGroup>
                        <label>
                            <input
                                type="radio"
                                name="uploadType"
                                value="file"
                                checked={uploadType === 'file'}
                                onChange={(e) => setUploadType(e.target.value)}
                                disabled={isCreating}
                            />
                            上传文件
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="uploadType"
                                value="link"
                                checked={uploadType === 'link'}
                                onChange={(e) => setUploadType(e.target.value)}
                                disabled={isCreating}
                            />
                            提供链接
                        </label>
                    </RadioGroup>
                </FormRowVertical>

                <FormRowVertical
                    label="标题"
                    error={/* Add potential error state */ null}
                >
                    <Input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={isCreating}
                    />
                </FormRowVertical>

                <FormRowVertical label="描述" error={null}>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        disabled={isCreating}
                    />
                </FormRowVertical>

                <FormRowVertical label="资源类型" error={null}>
                    <Select
                        id="resourceType"
                        value={resourceType}
                        onChange={(e) =>
                            setResourceType(Number(e.target.value))
                        }
                        options={[
                            { value: 1, label: '文档' },
                            { value: 2, label: '视频' },
                            { value: 3, label: '音频' },
                            { value: 4, label: '图片' },
                            { value: 5, label: '其他' },
                        ]}
                        disabled={isCreating}
                    />
                </FormRowVertical>

                <FormRowVertical label="学科" error={null}>
                    <Input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        disabled={isCreating}
                    />
                </FormRowVertical>

                <FormRowVertical label="年级" error={null}>
                    {/* Consider using Select if grades are predefined */}
                    <Input
                        type="text"
                        id="grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        required
                        disabled={isCreating}
                    />
                </FormRowVertical>

                <FormRowVertical label="难度" error={null}>
                    <Select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(Number(e.target.value))}
                        options={[
                            { value: 1, label: '入门' },
                            { value: 2, label: '初级' },
                            { value: 3, label: '中级' },
                            { value: 4, label: '高级' },
                            { value: 5, label: '专家' },
                        ]}
                        disabled={isCreating}
                    />
                </FormRowVertical>

                <FormRowVertical label="标签 (逗号分隔)" error={null}>
                    <Input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        disabled={isCreating}
                    />
                </FormRowVertical>

                <FormRowVertical label="价格 (0为免费)" error={null}>
                    <Input
                        type="number"
                        id="price"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        disabled={isCreating}
                    />
                </FormRowVertical>

                {uploadType === 'file' ? (
                    <FormRowVertical label="选择文件" error={null}>
                        {/* Make sure FileInput accepts an 'onChange' prop that provides the file object */}
                        <FileInput
                            id="resourceFile"
                            onChange={(e) => setFile(e.target.files[0])}
                            accept="*/*"
                            disabled={isCreating}
                        />
                    </FormRowVertical>
                ) : (
                    <FormRowVertical label="资源链接" error={null}>
                        <Input
                            type="url"
                            id="link"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            required
                            disabled={isCreating}
                        />
                    </FormRowVertical>
                )}

                <FormRowVertical>
                    {/* Disable button while creating */}
                    <Button type="submit" disabled={isCreating}>
                        {isCreating ? '上传中...' : '确认上传'}
                    </Button>
                </FormRowVertical>
            </FormContainer>
        </UploadPageLayout>
    )
}

export default Upload
