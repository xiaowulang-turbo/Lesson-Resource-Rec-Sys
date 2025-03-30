import { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
    HiOutlineUserGroup,
    HiOutlineWifi,
} from 'react-icons/hi2'
import { getSystemStats } from '../services/statsService'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import StatsCard from '../components/StatsCard'
import ResourceDistributionChart from '../components/ResourceDistributionChart'
import MonthlyActiveUsersChart from '../components/MonthlyActiveUsersChart'
import Spinner from '../ui/Spinner'

const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2.4rem;
    margin-bottom: 3.2rem;
`

const ChartsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2.4rem;
    margin-bottom: 3.2rem;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`

function Home() {
    const [stats, setStats] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                setIsLoading(true)
                const data = await getSystemStats()
                setStats(data)
            } catch (err) {
                setError('获取统计数据失败')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (isLoading) return <Spinner />

    if (error) return <p>{error}</p>

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">系统概览</Heading>
            </Row>

            <StatsContainer>
                <StatsCard
                    title="课程总数"
                    value={stats?.courseCount || 0}
                    icon={<HiOutlineAcademicCap />}
                    color="blue"
                />
                <StatsCard
                    title="资源总数"
                    value={stats?.resourceCount || 0}
                    icon={<HiOutlineBookOpen />}
                    color="green"
                />
                <StatsCard
                    title="用户总数"
                    value={stats?.userCount || 0}
                    icon={<HiOutlineUserGroup />}
                    color="indigo"
                />
                <StatsCard
                    title="当前在线"
                    value={stats?.onlineCount || 0}
                    icon={<HiOutlineWifi />}
                    color="yellow"
                    subtitle="人数"
                />
            </StatsContainer>

            <ChartsContainer>
                <ResourceDistributionChart
                    data={stats?.resourceDistribution || []}
                    title="资源类型分布"
                />
                <ResourceDistributionChart
                    data={stats?.difficultyDistribution || []}
                    title="难度等级分布"
                />
            </ChartsContainer>

            <MonthlyActiveUsersChart data={stats?.monthlyActiveUsers || []} />
        </>
    )
}

export default Home
