import styled from 'styled-components'
import Form from '../../ui/Form'
import FormRow from '../../ui/FormRow'
import Input from '../../ui/Input'
import Textarea from '../../ui/Textarea'
import Button from '../../ui/Button'
import Select from '../../ui/Select'
import { HiOutlineUserCircle } from 'react-icons/hi2'

const AccountSection = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem;
    margin-bottom: 2.4rem;
    box-shadow: var(--shadow-sm);
`

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;

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

function ProfileSection({ user, onUpdate }) {
    const gradeOptions = [
        { value: '小学', label: '小学' },
        { value: '初中', label: '初中' },
        { value: '高中', label: '高中' },
        { value: '大学', label: '大学' },
    ]

    const subjectOptions = [
        { value: '数学', label: '数学' },
        { value: '语文', label: '语文' },
        { value: '英语', label: '英语' },
        { value: '物理', label: '物理' },
        { value: '化学', label: '化学' },
        { value: '生物', label: '生物' },
        { value: '历史', label: '历史' },
        { value: '地理', label: '地理' },
        { value: '政治', label: '政治' },
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        onUpdate(user)
    }

    return (
        <AccountSection>
            <SectionHeader>
                <SectionIcon>
                    <HiOutlineUserCircle />
                    <h2>个人资料</h2>
                </SectionIcon>
            </SectionHeader>

            <Form onSubmit={handleSubmit}>
                <FormRow label="姓名">
                    <Input
                        type="text"
                        id="fullName"
                        value={user.fullName}
                        onChange={(e) => onUpdate({ fullName: e.target.value })}
                    />
                </FormRow>
                <FormRow label="邮箱">
                    <Input
                        type="email"
                        id="email"
                        value={user.email}
                        onChange={(e) => onUpdate({ email: e.target.value })}
                    />
                </FormRow>
                <FormRow label="电话">
                    <Input
                        type="tel"
                        id="phone"
                        value={user.phone}
                        onChange={(e) => onUpdate({ phone: e.target.value })}
                    />
                </FormRow>
                <FormRow label="教学科目">
                    <Select
                        id="subject"
                        options={subjectOptions}
                        value={subjectOptions.find(
                            (option) => option.value === user.subject
                        )}
                        onChange={(option) =>
                            onUpdate({ subject: option.value })
                        }
                    />
                </FormRow>
                <FormRow label="教学年级">
                    <Select
                        id="grade"
                        options={gradeOptions}
                        value={gradeOptions.find(
                            (option) => option.value === user.grade
                        )}
                        onChange={(option) => onUpdate({ grade: option.value })}
                    />
                </FormRow>
                <FormRow label="教龄">
                    <Input
                        type="text"
                        id="experience"
                        value={user.experience}
                        onChange={(e) =>
                            onUpdate({ experience: e.target.value })
                        }
                    />
                </FormRow>
                <FormRow label="个人简介">
                    <Textarea
                        id="bio"
                        value={user.bio}
                        onChange={(e) => onUpdate({ bio: e.target.value })}
                    />
                </FormRow>
                <FormRow>
                    <Button type="reset" variation="secondary">
                        取消
                    </Button>
                    <Button type="submit">保存信息</Button>
                </FormRow>
            </Form>
        </AccountSection>
    )
}

export default ProfileSection
