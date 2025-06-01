import styled from 'styled-components'
import PropTypes from 'prop-types'

import Button from './Button'
import Heading from './Heading'

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

ConfirmDelete.propTypes = {
    resourceName: PropTypes.string,
    onConfirm: PropTypes.func,
    disabled: PropTypes.bool,
    onCloseModal: PropTypes.func,
}

function ConfirmDelete({ resourceName, onConfirm, disabled, onCloseModal }) {
    return (
        <StyledConfirmDelete>
            <Heading as="h3">删除{resourceName}</Heading>
            <p>确定要删除该{resourceName}吗？此操作无法撤销。</p>

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
                    确认删除
                </Button>
            </div>
        </StyledConfirmDelete>
    )
}

export default ConfirmDelete
