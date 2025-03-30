import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import styled from 'styled-components'
import Heading from '../ui/Heading'
import { useDarkMode } from '../context/DarkModeContext'

const ChartBox = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem 3.2rem;
    grid-column: 1 / -1;
    box-shadow: var(--shadow-sm);

    & > *:first-child {
        margin-bottom: 1.6rem;
    }

    /* 修改网格线颜色 */
    & .recharts-cartesian-grid-horizontal line,
    & .recharts-cartesian-grid-vertical line {
        stroke: var(--color-grey-300);
    }
`

const months = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
]

export default function MonthlyActiveUsersChart({ data = [] }) {
    const { isDarkMode } = useDarkMode()

    // 如果没有传入数据，使用默认数据
    const chartData =
        data.length === 12
            ? data.map((value, index) => ({
                  name: months[index],
                  用户数: value,
              }))
            : months.map((month, index) => ({
                  name: month,
                  用户数: Math.floor(Math.random() * 5000) + 1000,
              }))

    // 根据暗黑模式设置不同的颜色
    const colors = isDarkMode
        ? {
              stroke: '#4f46e5',
              fill: '#4f46e5',
              text: '#e5e7eb',
              background: '#18212f',
          }
        : {
              stroke: '#4f46e5',
              fill: '#c7d2fe',
              text: '#374151',
              background: '#fff',
          }

    return (
        <ChartBox>
            <Heading as="h3">月度活跃用户</Heading>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                    <XAxis
                        dataKey="name"
                        tick={{ fill: colors.text }}
                        tickLine={{ stroke: colors.text }}
                    />
                    <YAxis
                        tick={{ fill: colors.text }}
                        tickLine={{ stroke: colors.text }}
                    />
                    <CartesianGrid strokeDasharray="4" />
                    <Tooltip
                        contentStyle={{ backgroundColor: colors.background }}
                        formatter={(value) => [`${value} 人`, '活跃用户']}
                    />
                    <Area
                        type="monotone"
                        dataKey="用户数"
                        stroke={colors.stroke}
                        fill={colors.fill}
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartBox>
    )
}
