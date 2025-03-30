import styled from 'styled-components'

const Card = styled.div`
    background-color: var(--color-grey-0);
    border-radius: var(--border-radius-md);
    padding: 2rem;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.2rem;
    transition: all 0.3s;

    &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
    }
`

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

const Title = styled.h3`
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--color-grey-500);
`

const IconContainer = styled.div`
    width: 4.8rem;
    height: 4.8rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${(props) => `var(--color-${props.color}-100)`};

    & svg {
        width: 2.4rem;
        height: 2.4rem;
        color: ${(props) => `var(--color-${props.color}-700)`};
    }
`

const Value = styled.p`
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-grey-700);
`

const Subtitle = styled.p`
    font-size: 1.4rem;
    color: var(--color-grey-500);
`

function StatsCard({ title, value, icon, color, subtitle }) {
    return (
        <Card>
            <CardHeader>
                <Title>{title}</Title>
                <IconContainer color={color}>{icon}</IconContainer>
            </CardHeader>
            <Value>{value}</Value>
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </Card>
    )
}

export default StatsCard
