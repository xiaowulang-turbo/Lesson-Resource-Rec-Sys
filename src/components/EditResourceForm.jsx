import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { updateResource } from '../services/apiResources'
import Form from '../ui/Form'
import FormRowVertical from '../ui/FormRowVertical'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import Button from '../ui/Button'
import FileInput from '../ui/FileInput'

const FormContainer = styled(Form)`
    width: 100%;
    max-width: 60rem;
    padding: 2.4rem 0;
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

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
    margin-top: 2.4rem;
`

function EditResourceForm({ resource, onCloseModal, onSuccess }) {
    const queryClient = useQueryClient()

    // 状态管理
    const [uploadType, setUploadType] = useState('file')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [resourceType, setResourceType] = useState(1)
    const [subject, setSubject] = useState('')
    const [grade, setGrade] = useState('')
    const [difficulty, setDifficulty] = useState(3)
    const [tags, setTags] = useState('')
    const [file, setFile] = useState(null)
    const [link, setLink] = useState('')
    const [price, setPrice] = useState(0)

    // 填充表单数据
    useEffect(() => {
        if (resource) {
            setTitle(resource.title || '')
            setDescription(resource.description || '')
            setResourceType(resource.type || 1)
            setSubject(resource.subject || '')
            setGrade(resource.grade || '')
            setDifficulty(resource.difficulty || 3)
            setTags(resource.tags?.join(', ') || '')
            setPrice(resource.price || 0)

            // 设置上传类型
            if (resource.url && resource.url.startsWith('http')) {
                setUploadType('link')
                setLink(resource.url || '')
            } else {
                setUploadType('file')
                // 文件不能预填充，只能显示当前文件名
            }
        }
    }, [resource])

    // 处理资源更新
    const { mutate, isLoading: isUpdating } = useMutation({
        mutationFn: updateResource,
        onSuccess: () => {
            toast.success('资源更新成功！')
            queryClient.invalidateQueries({ queryKey: ['resources'] })
            queryClient.invalidateQueries({
                queryKey: ['resource', resource._id],
            })
            onSuccess?.()
            onCloseModal?.()
        },
        onError: (err) => {
            toast.error(err.message || '更新资源失败')
        },
    })

    // 表单提交处理
    const handleSubmit = (e) => {
        e.preventDefault()

        // 基本验证
        if (
            !title.trim() ||
            !description.trim() ||
            !subject.trim() ||
            !grade.trim()
        ) {
            toast.error('请填写所有必填项 (标题、描述、学科、年级)')
            return
        }

        if (uploadType === 'link' && !link.trim()) {
            toast.error('请输入有效的链接')
            return
        }

        // 准备提交的数据
        const formData = new FormData()
        formData.append('id', resource._id)
        formData.append('title', title)
        formData.append('description', description)
        formData.append('type', resourceType)
        formData.append('subject', subject)
        formData.append('grade', grade)
        formData.append('difficulty', difficulty)

        // 处理标签
        const tagArray = tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        tagArray.forEach((tag) => formData.append('tags[]', tag))

        formData.append('price', price)

        // 文件或链接
        if (uploadType === 'file' && file) {
            formData.append('resourceFile', file)
        } else if (uploadType === 'link') {
            formData.append('url', link.trim())
        }

        // 提交更新
        mutate(formData)
    }

    return (
        <FormContainer
            onSubmit={handleSubmit}
            type={isUpdating ? 'disabled' : 'regular'}
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
                            disabled={isUpdating}
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
                            disabled={isUpdating}
                        />
                        提供链接
                    </label>
                </RadioGroup>
            </FormRowVertical>

            <FormRowVertical label="标题" error={null}>
                <Input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isUpdating}
                />
            </FormRowVertical>

            <FormRowVertical label="描述" error={null}>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isUpdating}
                />
            </FormRowVertical>

            <FormRowVertical label="资源类型" error={null}>
                <Select
                    id="resourceType"
                    value={resourceType}
                    onChange={(e) => setResourceType(Number(e.target.value))}
                    options={[
                        { value: 308, label: '电子教材' },
                        { value: 310, label: '实践项目' },
                        { value: 311, label: '练习题库' },
                        { value: 312, label: '参考资料' },
                    ]}
                    disabled={isUpdating}
                />
            </FormRowVertical>

            <FormRowVertical label="学科" error={null}>
                <Input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    disabled={isUpdating}
                />
            </FormRowVertical>

            <FormRowVertical label="年级" error={null}>
                <Input
                    type="text"
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    required
                    disabled={isUpdating}
                />
            </FormRowVertical>

            <FormRowVertical label="难度" error={null}>
                <Select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                    options={[
                        { value: 1, label: '入门级' },
                        { value: 2, label: '初级' },
                        { value: 3, label: '中级' },
                        { value: 4, label: '高级' },
                        { value: 5, label: '专家级' },
                    ]}
                    disabled={isUpdating}
                />
            </FormRowVertical>

            <FormRowVertical label="标签 (用逗号分隔)" error={null}>
                <Input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    disabled={isUpdating}
                    placeholder="例如: 数学, 代数, 高中"
                />
            </FormRowVertical>

            <FormRowVertical label="价格" error={null}>
                <Input
                    type="number"
                    id="price"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    disabled={isUpdating}
                />
            </FormRowVertical>

            {uploadType === 'file' && (
                <FormRowVertical label="上传文件" error={null}>
                    <FileInput
                        id="resourceFile"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.mp4,.mp3,.jpg,.jpeg,.png"
                        onChange={(e) => setFile(e.target.files[0])}
                        disabled={isUpdating}
                    />
                    {resource?.url && !resource.url.startsWith('http') && (
                        <p
                            style={{
                                marginTop: '0.8rem',
                                fontSize: '1.4rem',
                                color: 'var(--color-grey-500)',
                            }}
                        >
                            当前文件: {resource.url.split('/').pop()}
                        </p>
                    )}
                </FormRowVertical>
            )}

            {uploadType === 'link' && (
                <FormRowVertical label="资源链接" error={null}>
                    <Input
                        type="url"
                        id="link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        disabled={isUpdating}
                        placeholder="https://example.com/resource"
                    />
                </FormRowVertical>
            )}

            <ButtonGroup>
                <Button
                    type="reset"
                    variation="secondary"
                    onClick={onCloseModal}
                    disabled={isUpdating}
                >
                    取消
                </Button>
                <Button disabled={isUpdating}>
                    {isUpdating ? '更新中...' : '更新资源'}
                </Button>
            </ButtonGroup>
        </FormContainer>
    )
}

export default EditResourceForm
