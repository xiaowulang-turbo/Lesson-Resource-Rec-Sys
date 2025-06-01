import { useState } from 'react'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import Select from '../../ui/Select'

function EditUserForm({ user, onSubmit, onCancel, isLoading }) {
    const [form, setForm] = useState({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(form)
    }

    return (
        <form onSubmit={handleSubmit} style={{ minWidth: 0 }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.6rem',
                }}
            >
                <label>
                    用户名：
                    <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    邮箱：
                    <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    角色：
                    <Select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        options={[
                            { value: 'user', label: '普通用户' },
                            { value: 'teacher', label: '教师' },
                            { value: 'admin', label: '管理员' },
                        ]}
                    />
                </label>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem',
                    }}
                >
                    <Button
                        type="button"
                        variation="secondary"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        取消
                    </Button>
                    <Button
                        type="submit"
                        variation="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? '保存中...' : '保存'}
                    </Button>
                </div>
            </div>
        </form>
    )
}

export default EditUserForm
