import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { getResourceById, updateResource } from '../services/apiResources'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import Form from '../ui/Form'
import FormRowVertical from '../ui/FormRowVertical'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import FileInput from '../ui/FileInput'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'

const EditPageLayout = styled.div`
    padding: 3.2rem 4.8rem;
`

const FormContainer = styled(Form)`
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

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
    margin-top: 2.4rem;
`

function EditResource() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    console.log('EditResource: 组件加载，资源ID:', id)

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

    // 获取资源数据
    const {
        data: resource,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['resource', id],
        queryFn: () => {
            if (!id || id === 'null' || id === 'undefined') {
                throw new Error('无效的资源ID')
            }
            return getResourceById(id)
        },
        retry: false,
        enabled: !!id && id !== 'null' && id !== 'undefined',
        onSuccess: (data) => {
            // 填充表单数据
            setTitle(data.title || '')
            setDescription(data.description || '')
            setResourceType(data.type || 1)
            setSubject(data.subject || '')
            setGrade(data.grade || '')
            setDifficulty(data.difficulty || 3)
            setTags(data.tags?.join(', ') || '')
            setPrice(data.price || 0)

            // 设置上传类型
            if (data.url && data.url.startsWith('http')) {
                setUploadType('link')
                setLink(data.url || '')
            } else {
                setUploadType('file')
                // 文件不能预填充，只能显示当前文件名
            }
        },
    })

    // 处理资源更新
    const { mutate, isLoading: isUpdating } = useMutation({
        mutationFn: updateResource,
        onSuccess: () => {
            toast.success('资源更新成功！')
            queryClient.invalidateQueries({ queryKey: ['resources'] })
            queryClient.invalidateQueries({
                queryKey: ['resource', id],
            })
            // navigate(`/resources/${id}`)
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

        console.log('提交资源编辑，资源ID:', id)

        if (!id || id === 'null' || id === 'undefined') {
            toast.error('无效的资源ID，无法更新')
            return
        }

        // 准备提交的数据
        const formData = new FormData()
        formData.append('id', id)
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
        // tagArray.forEach((tag) => formData.append('tags[]', tag))

        // 正确处理标签 - 使用不带方括号的字段名
        if (tagArray.length > 0) {
            tagArray.forEach((tag) => formData.append('tags', tag))
        }

        formData.append('price', price)

        // 文件或链接
        if (uploadType === 'file' && file) {
            console.log('添加文件到表单:', file.name)
            formData.append('resourceFile', file)
        } else if (uploadType === 'link') {
            console.log('添加链接到表单:', link)
            formData.append('url', link.trim())
        }

        // 打印表单数据便于调试
        console.log('提交表单数据:')
        for (const [key, value] of formData.entries()) {
            console.log(
                `- ${key}: ${value instanceof File ? value.name : value}`
            )
        }

        // 提交更新
        mutate(formData)
    }

    // 取消编辑
    const handleCancel = () => {
        navigate(`/resources/${id}`)
    }

    if (isLoading) return <Spinner />
    if (error) return <p>加载资源失败：{error.message}</p>

    return (
        <EditPageLayout>
            <Row
                type="horizontal"
                style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2.4rem',
                }}
            >
                <Heading as="h1">编辑资源</Heading>
            </Row>
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

                {uploadType === 'file' && (
                    <FormRowVertical label="文件" error={null}>
                        <FileInput
                            id="resourceFile"
                            accept="*/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            disabled={isUpdating}
                        />
                        {!file &&
                            resource?.url &&
                            !resource.url.startsWith('http') && (
                                <p
                                    style={{
                                        marginTop: '0.8rem',
                                        color: 'var(--color-grey-500)',
                                    }}
                                >
                                    当前文件: {resource.url.split('/').pop()}
                                </p>
                            )}
                    </FormRowVertical>
                )}

                {uploadType === 'link' && (
                    <FormRowVertical label="链接" error={null}>
                        <Input
                            type="url"
                            id="link"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            disabled={isUpdating}
                        />
                    </FormRowVertical>
                )}

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
                        onChange={(e) =>
                            setResourceType(Number(e.target.value))
                        }
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
                        placeholder="例如：高中, 物理, 力学"
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

                <ButtonGroup>
                    <Button
                        variation="secondary"
                        type="button"
                        onClick={handleCancel}
                        disabled={isUpdating}
                    >
                        取消
                    </Button>
                    <Button variation="primary" disabled={isUpdating}>
                        {isUpdating ? '保存中...' : '保存修改'}
                    </Button>
                </ButtonGroup>
            </FormContainer>
        </EditPageLayout>
    )
}

export default EditResource
