import { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Heading from '../ui/Heading'
import Row from '../ui/Row'

const StyledHome = styled.main`
    padding: 4rem 2.4rem;
    max-width: 120rem;
    margin: 0 auto;
`

const FeaturesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
    gap: 2.4rem;
    margin-top: 4rem;
`

const FeatureCard = styled(Link)`
    background-color: var(--color-grey-0);
    border-radius: var(--border-radius-md);
    padding: 2.4rem;
    text-decoration: none;
    color: inherit;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s;

    &:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
    }
`

const FeatureTitle = styled.h3`
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 1.2rem;
    color: var(--color-grey-800);
`

const FeatureDescription = styled.p`
    font-size: 1.6rem;
    color: var(--color-grey-500);
    line-height: 1.6;
`

const SubHeading = styled.p`
    font-size: 1.8rem;
    color: var(--color-grey-500);
    text-align: center;
    max-width: 80rem;
    margin: 0 auto 4rem auto;
`

function Home() {
    return (
        <StyledHome>
            <Row>
                <Heading as="h1" type="h4">
                    欢迎使用学习资源推荐系统
                </Heading>
                <SubHeading>发现优质课程，提升学习效率</SubHeading>
            </Row>

            <FeaturesGrid>
                <FeatureCard to="/courses">
                    <FeatureTitle>课程中心</FeatureTitle>
                    <FeatureDescription>
                        浏览和搜索各类优质课程，找到最适合你的学习资源
                    </FeatureDescription>
                </FeatureCard>

                <FeatureCard to="/resources">
                    <FeatureTitle>学习资源</FeatureTitle>
                    <FeatureDescription>
                        获取丰富的学习资料，包括文档、视频和练习题
                    </FeatureDescription>
                </FeatureCard>

                <FeatureCard to="/profile">
                    <FeatureTitle>个人中心</FeatureTitle>
                    <FeatureDescription>
                        管理你的学习进度，查看学习历史和个性化推荐
                    </FeatureDescription>
                </FeatureCard>
            </FeaturesGrid>
        </StyledHome>
    )
}

export default Home
