import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
    HiOutlineUserGroup,
    HiOutlineWifi,
} from 'react-icons/hi2'
import { getSystemStats } from '../services/apiStats'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import StatsCard from '../components/StatsCard'
import ResourceDistributionChart from '../components/ResourceDistributionChart'
import MonthlyActiveUsersChart from '../components/MonthlyActiveUsersChart'
import Spinner from '../ui/Spinner'
import ResourceList from '../components/ResourceList'
// 引入 Swiper React 组件和核心样式
import { Swiper, SwiperSlide } from 'swiper/react'
// 引入 Swiper 模块（例如 Navigation, Pagination, Autoplay）
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
// 引入 Swiper 核心和模块样式
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
// import 'swiper/css/autoplay' // 如果需要自动播放
// 假设这些 API 函数存在于 services/apiResources.js 或类似文件中
// import { getCarouselResources, getRecentResources, getRecommendedResources } from '../services/apiResources';

// --- 模拟 API 函数，实际应替换为真实 API 调用 ---
const fakeApiCall = (data, delay = 500) =>
    new Promise((resolve) => setTimeout(() => resolve(data), delay))

// --- 更新模拟 API 函数，返回多个轮播项 ---
const getCarouselResources = () =>
    fakeApiCall([
        {
            _id: 'carousel1', // 使用 _id 保持一致性
            title: '探索 React Hooks 的奥秘',
            description: '深入理解 useState, useEffect 等核心 Hooks',
            url: 'https://picsum.photos/1200/350?random=1&blur=1',
            link: '/resources/recent1', // 假设点击轮播图可以跳转到某个资源详情页
        },
        {
            _id: 'carousel2',
            title: 'Node.js 异步编程实践',
            description: '掌握 async/await 和事件循环',
            url: 'https://picsum.photos/1200/350?random=2&blur=1',
            link: '/resources/recent2',
        },
        {
            _id: 'carousel3',
            title: '精通 CSS Grid 布局',
            description: '构建现代、响应式的网页布局',
            url: 'https://picsum.photos/1200/350?random=3&blur=1',
            link: '/resources/rec1',
        },
        {
            _id: 'carousel4',
            title: '数据库设计与优化',
            description: '从范式到索引，提升数据库性能',
            url: 'https://picsum.photos/1200/350?random=4&blur=1',
            link: '/resources/rec2',
        },
    ])
const getRecentResources = () =>
    fakeApiCall([
        {
            _id: 'recent1',
            title: '最近上新资源 A',
            description: '这是资源 A 的描述...',
            publisher: '出版社 X',
            difficulty: 2,
            type: 308,
            tags: ['React', 'Web开发'],
            url: 'https://picsum.photos/400/180?random=2',
        },
        {
            _id: 'recent2',
            title: '最近上新资源 B',
            description: '这是资源 B 的描述...',
            publisher: '出版社 Y',
            difficulty: 4,
            type: 310,
            tags: ['Node.js'],
            enrollCount: 150,
            averageRating: 4.5,
            price: 50,
            url: 'https://picsum.photos/400/180?random=3',
        },
        // 可以添加更多模拟数据
    ])
const getRecommendedResources = () =>
    fakeApiCall([
        {
            _id: 'rec1',
            title: '为你推荐资源 C',
            description: '这是资源 C 的描述...',
            publisher: '出版社 Z',
            difficulty: 3,
            type: 311,
            tags: ['数据库', 'SQL'],
            url: 'https://picsum.photos/400/180?random=4',
        },
        {
            _id: 'rec2',
            title: '为你推荐资源 D',
            description: '这是资源 D 的描述...',
            publisher: '出版社 W',
            difficulty: 5,
            type: 312,
            tags: ['算法', '数据结构'],
            enrollCount: 200,
            averageRating: 4.8,
            url: 'https://picsum.photos/400/180?random=5',
        },
        // 可以添加更多模拟数据
    ])
// --- 模拟 API 函数结束 ---

// --- 新增 Swiper 容器样式 ---
const StyledSwiper = styled(Swiper)`
    width: 100%;
    height: 350px; // 根据图片高度调整
    margin-bottom: 3.2rem;
    border-radius: var(--border-radius-lg);
    overflow: hidden; // 确保圆角生效

    .swiper-slide {
        text-align: center;
        font-size: 18px;
        background: #fff; // 可以设置背景色

        /* Center slide text vertically */
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative; // 用于定位内部元素
    }

    .swiper-slide img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(0.7); // 图片稍暗，使文字更清晰
    }

    .slide-content {
        position: absolute;
        bottom: 30px; // 调整内容位置
        left: 30px;
        right: 30px;
        color: #fff;
        text-align: left; // 文字左对齐
        background-color: rgba(0, 0, 0, 0.4); // 添加半透明背景
        padding: 1.5rem;
        border-radius: var(--border-radius-md);
        max-width: 60%; // 限制内容宽度
    }

    .slide-title {
        font-size: 2.4rem; // 增大标题字号
        font-weight: 600;
        margin-bottom: 0.8rem;
    }

    .slide-description {
        font-size: 1.6rem;
    }

    // 自定义分页器颜色
    .swiper-pagination-bullet-active {
        background-color: var(--color-brand-600);
    }

    // 自定义导航按钮样式 (如果需要)
    .swiper-button-next,
    .swiper-button-prev {
        color: var(--color-brand-600);
        &:after {
            font-size: 2rem !important; // 调整箭头大小
        }
    }
`

// 用于包裹每个部分的容器
const Section = styled.section`
    margin-bottom: 4.8rem;

    &:last-child {
        margin-bottom: 0;
    }
`

function Home() {
    // 注意：实际应用中，轮播图数据结构可能更复杂
    const [carouselData, setCarouselData] = useState([])
    const [recentResources, setRecentResources] = useState([])
    const [recommendedResources, setRecommendedResources] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true)
                setError(null)

                // 并行获取数据
                const [carouselRes, recentRes, recommendedRes] =
                    await Promise.all([
                        getCarouselResources(),
                        getRecentResources(/* { limit: 5 } */), // 如果 API 支持，可以传递参数
                        getRecommendedResources(/* { limit: 5 } */),
                    ])

                // 假设 API 直接返回数组
                setCarouselData(carouselRes)
                setRecentResources(recentRes)
                setRecommendedResources(recommendedRes)
            } catch (err) {
                console.error('获取首页数据失败:', err)
                setError('无法加载首页数据，请稍后再试。')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    if (isLoading) return <Spinner />

    if (error)
        return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>

    return (
        <>
            {/* 1. 轮播图 Section - 使用 Swiper */}
            <Section>
                {carouselData.length > 0 ? (
                    <StyledSwiper
                        modules={[Navigation, Pagination, Autoplay]} // 注册模块
                        spaceBetween={0} // Slide 之间的间距
                        slidesPerView={1} // 每次显示一个 Slide
                        navigation // 启用导航按钮
                        pagination={{ clickable: true }} // 启用分页器并允许点击
                        loop={true} // 开启循环模式
                        autoplay={{
                            // 自动播放配置
                            delay: 4000, // 4秒切换一次
                            disableOnInteraction: false, // 用户操作后不停止自动播放
                        }}
                        // onSlideChange={() => console.log('slide change')}
                        // onSwiper={(swiper) => console.log(swiper)}
                    >
                        {carouselData.map((item) => (
                            <SwiperSlide key={item._id}>
                                {/* 可以添加链接，如果需要点击跳转 */}
                                {/* <a href={item.link} target="_blank" rel="noopener noreferrer"> */}
                                <img src={item.url} alt={item.title} />
                                <div className="slide-content">
                                    <div className="slide-title">
                                        {item.title}
                                    </div>
                                    <div className="slide-description">
                                        {item.description}
                                    </div>
                                </div>
                                {/* </a> */}
                            </SwiperSlide>
                        ))}
                    </StyledSwiper>
                ) : (
                    !isLoading && <p>暂无轮播内容</p>
                )}
            </Section>

            {/* 2. 最近上新 Section */}
            <Section>
                <Row
                    type="horizontal"
                    style={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.6rem',
                    }}
                >
                    <Heading as="h2">最近上新</Heading>
                </Row>
                {recentResources.length > 0 ? (
                    <ResourceList resources={recentResources} layout="grid" />
                ) : (
                    !isLoading && <p>暂无最近上新资源</p>
                )}
            </Section>

            {/* 3. 为你推荐 Section */}
            <Section>
                <Row
                    type="horizontal"
                    style={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.6rem',
                    }}
                >
                    <Heading as="h2">为你推荐</Heading>
                </Row>
                {recommendedResources.length > 0 ? (
                    <ResourceList
                        resources={recommendedResources}
                        layout="grid"
                    />
                ) : (
                    !isLoading && <p>暂无推荐资源</p>
                )}
            </Section>
        </>
    )
}

export default Home
