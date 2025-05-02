import { useState, useEffect } from 'react'
import styled from 'styled-components'
import Form from '../../ui/Form'
import FormRow from '../../ui/FormRow'
import Input from '../../ui/Input'
import Textarea from '../../ui/Textarea'
import Button from '../../ui/Button'
import Spinner from '../../ui/Spinner'
import { HiOutlineUserCircle } from 'react-icons/hi2'
import useUserProfile from '../../hooks/useUserProfile'
import toast from 'react-hot-toast'

const FormContainer = styled.div`
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    /* padding: 2rem; */
`

const AccountSection = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 3rem;
    margin-bottom: 2.4rem;
    box-shadow: var(--shadow-sm);
`

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 3rem;

    & h2 {
        font-size: 2rem;
        font-weight: 600;
    }
`

const SectionIcon = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--color-brand-600);

    & svg {
        width: 2.4rem;
        height: 2.4rem;
    }
`

// 添加表单行样式，增加间距
const StyledFormRow = styled(FormRow)`
    margin-bottom: 1.8rem;
`

function ProfileSection() {
    const { user, updateUser, isLoading, error } = useUserProfile()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        bio: '',
    })

    // 同步用户数据到表单
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
            })
        }
    }, [user])

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const result = await updateUser(formData)
            if (result) {
                toast.success('个人资料更新成功!')
            }
        } catch (err) {
            console.error('提交表单时出错:', err)
            toast.error(err.message || '更新个人资料失败')
        }
    }

    const handleReset = () => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
            })
            toast.success('表单已重置')
        }
    }

    if (isLoading) return <Spinner />

    return (
        <FormContainer>
            <AccountSection>
                <SectionHeader>
                    <SectionIcon>
                        <HiOutlineUserCircle />
                        <h2>个人资料</h2>
                    </SectionIcon>
                </SectionHeader>

                {error && (
                    <p style={{ color: 'var(--color-red-700)' }}>{error}</p>
                )}

                <Form onSubmit={handleSubmit}>
                    <StyledFormRow label="姓名">
                        <Input
                            type="text"
                            id="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </StyledFormRow>
                    <StyledFormRow label="邮箱">
                        <Input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </StyledFormRow>
                    <StyledFormRow label="电话">
                        <Input
                            type="tel"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </StyledFormRow>
                    <StyledFormRow label="个人简介">
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={handleChange}
                        />
                    </StyledFormRow>
                    <StyledFormRow>
                        <Button
                            type="button"
                            variation="secondary"
                            onClick={handleReset}
                        >
                            取消
                        </Button>
                        <Button type="submit">保存信息</Button>
                    </StyledFormRow>
                </Form>
            </AccountSection>
        </FormContainer>
    )
}

export default ProfileSection
