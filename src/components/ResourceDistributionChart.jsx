import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'
import styled from 'styled-components'
import Heading from '../ui/Heading'
import { useDarkMode } from '../context/DarkModeContext'

const ChartBox = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem 3.2rem;
    grid-column: span 1;
    box-shadow: var(--shadow-sm);

    & > *:first-child {
        margin-bottom: 1.6rem;
    }

    & .recharts-pie-label-text {
        font-weight: 600;
    }
`

// 浅色模式下的颜色
const colorsLight = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#14b8a6',
    '#3b82f6',
    '#a855f7',
]

// 深色模式下的颜色
const colorsDark = [
    '#b91c1c',
    '#c2410c',
    '#a16207',
    '#4d7c0f',
    '#15803d',
    '#0f766e',
    '#1d4ed8',
    '#7e22ce',
]

export default function ResourceDistributionChart({
    data = [],
    title = '资源类型分布',
}) {
    const { isDarkMode } = useDarkMode()
    const colors = isDarkMode ? colorsDark : colorsLight

    // 确保数据有效
    const validData =
        data.length > 0
            ? data.filter((item) => item.value > 0)
            : [
                  { name: '电子教材', value: 120 },
                  { name: '实践项目', value: 80 },
                  { name: '练习题库', value: 150 },
                  { name: '参考资料', value: 200 },
                  { name: '其他资源', value: 50 },
              ]

    return (
        <ChartBox>
            <Heading as="h3">{title}</Heading>

            <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                    <Pie
                        data={validData}
                        nameKey={'name'}
                        dataKey="value"
                        innerRadius={85}
                        outerRadius={110}
                        paddingAngle={3}
                        cx={'40%'}
                        cy={'50%'}
                    >
                        {validData.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                fill={colors[index % colors.length]}
                                stroke={colors[index % colors.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} 个`} />
                    <Legend
                        verticalAlign="middle"
                        align="right"
                        width="30%"
                        layout="vertical"
                        iconType="circle"
                        iconSize={15}
                    />
                </PieChart>
            </ResponsiveContainer>
        </ChartBox>
    )
}
