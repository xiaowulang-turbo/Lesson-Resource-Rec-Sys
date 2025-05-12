import styled from 'styled-components'
import Button from '../ui/Button'
import Heading from '../ui/Heading'

const StyledConfirmDelete = styled.div`
    width: 40rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;

    & p {
        color: var(--color-grey-500);
        margin-bottom: 1.2rem;
    }

    & div {
        display: flex;
        justify-content: flex-end;
        gap: 1.2rem;
    }
`

function ConfirmDelete({ resourceName, disabled, onConfirm, onCloseModal }) {
    return (
        <StyledConfirmDelete>
            <Heading as="h3">删除{resourceName || '资源'}</Heading>
            <p>
                您确定要删除此{resourceName || '资源'}
                吗？此操作将无法撤销，所有相关数据将被永久删除。
            </p>

            <div>
                <Button
                    variation="secondary"
                    disabled={disabled}
                    onClick={onCloseModal}
                >
                    取消
                </Button>
                <Button
                    variation="danger"
                    disabled={disabled}
                    onClick={onConfirm}
                >
                    {disabled ? '删除中...' : '确认删除'}
                </Button>
            </div>
        </StyledConfirmDelete>
    )
}

export default ConfirmDelete
