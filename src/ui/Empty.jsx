/* eslint-disable react/prop-types */
import styled from 'styled-components'

const EmptyContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: var(--color-grey-500);
    min-height: 200px;
`

const EmptyIcon = styled.div`
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.6;
`

const EmptyMessage = styled.p`
    font-size: 1.6rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--color-grey-600);
`

const EmptySubtext = styled.p`
    font-size: 1.4rem;
    color: var(--color-grey-500);
    margin: 0;
`

function Empty({ resource, resourceName, icon = '📭', message, subtext }) {
    // 优先使用传入的resource或resourceName
    const displayResource = resource || resourceName || '内容'

    // 默认消息
    const defaultMessage = message || `暂无${displayResource}`
    const defaultSubtext =
        subtext || `还没有任何${displayResource}，快去添加一些吧！`

    return (
        <EmptyContainer>
            <EmptyIcon>{icon}</EmptyIcon>
            <EmptyMessage>{defaultMessage}</EmptyMessage>
            <EmptySubtext>{defaultSubtext}</EmptySubtext>
        </EmptyContainer>
    )
}

export default Empty
