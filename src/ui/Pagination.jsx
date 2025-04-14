/* eslint-disable react/prop-types */
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { PAGE_SIZE } from '../utils/constants'

const StyledPagination = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2.4rem;
`

const P = styled.p`
    font-size: 1.4rem;
    margin-left: 0.8rem;

    & span {
        font-weight: 600;
    }
`

const Buttons = styled.div`
    display: flex;
    gap: 0.6rem;
    align-items: center;
`

const PaginationButton = styled.button`
    background-color: ${(props) =>
        props.active ? ' var(--color-brand-600)' : 'var(--color-grey-50)'};
    color: ${(props) => (props.active ? ' var(--color-brand-50)' : 'inherit')};
    border: none;
    border-radius: var(--border-radius-sm);
    font-weight: 500;
    font-size: 1.4rem;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.6rem 1.2rem;
    transition: all 0.3s;
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};

    &:has(span:last-child) {
        padding-left: 0.4rem;
    }

    &:has(span:first-child) {
        padding-right: 0.4rem;
    }

    & svg {
        height: 1.8rem;
        width: 1.8rem;
    }

    &:hover:not(:disabled) {
        background-color: var(--color-brand-600);
        color: var(--color-brand-50);
    }
`

const PageNumber = styled.button`
    background-color: ${(props) =>
        props.active ? ' var(--color-brand-600)' : 'var(--color-grey-50)'};
    color: ${(props) => (props.active ? ' var(--color-brand-50)' : 'inherit')};
    border: none;
    border-radius: var(--border-radius-sm);
    font-weight: 500;
    font-size: 1.4rem;
    width: 3.2rem;
    height: 3.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
        background-color: var(--color-brand-600);
        color: var(--color-brand-50);
    }
`

const Dots = styled.span`
    font-size: 1.4rem;
    color: var(--color-grey-500);
    margin: 0 0.4rem;
`

export default function Pagination({ count }) {
    const pageCount = Math.ceil(count / PAGE_SIZE)

    const [searchParams, setSearchParams] = useSearchParams()
    const currentPage = parseInt(searchParams.get('page') || 1)

    function prevPage() {
        const prev = currentPage <= 1 ? currentPage : parseInt(currentPage) - 1

        searchParams.set('page', prev)
        setSearchParams(searchParams)
    }

    function nextPage() {
        const next =
            currentPage >= pageCount ? pageCount : parseInt(currentPage) + 1

        searchParams.set('page', next)
        setSearchParams(searchParams)
    }

    function handlePageClick(page) {
        searchParams.set('page', page)
        setSearchParams(searchParams)
    }

    // 生成页码按钮数组
    const pageNumbers = []
    const displayPageCount = 5 // 显示5个页码按钮

    let startPage = Math.max(1, currentPage - Math.floor(displayPageCount / 2))
    let endPage = Math.min(pageCount, startPage + displayPageCount - 1)

    // 调整startPage，确保显示足够的页码
    if (endPage - startPage + 1 < displayPageCount) {
        startPage = Math.max(1, endPage - displayPageCount + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
    }

    if (pageCount <= 1) return null

    return (
        <StyledPagination>
            <P>
                显示 <span>{(currentPage - 1) * PAGE_SIZE + 1}</span> 至{' '}
                <span>
                    {currentPage * PAGE_SIZE > count
                        ? count
                        : currentPage * PAGE_SIZE}
                </span>{' '}
                共 <span>{count}</span> 个资源
            </P>
            <Buttons>
                <PaginationButton
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                >
                    <HiChevronLeft /> <span>上一页</span>
                </PaginationButton>

                {startPage > 1 && (
                    <>
                        <PageNumber
                            onClick={() => handlePageClick(1)}
                            active={currentPage === 1}
                        >
                            1
                        </PageNumber>
                        {startPage > 2 && <Dots>...</Dots>}
                    </>
                )}

                {pageNumbers.map((page) => (
                    <PageNumber
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageClick(page)}
                    >
                        {page}
                    </PageNumber>
                ))}

                {endPage < pageCount && (
                    <>
                        {endPage < pageCount - 1 && <Dots>...</Dots>}
                        <PageNumber
                            onClick={() => handlePageClick(pageCount)}
                            active={currentPage === pageCount}
                        >
                            {pageCount}
                        </PageNumber>
                    </>
                )}

                <PaginationButton
                    onClick={nextPage}
                    disabled={currentPage >= pageCount}
                >
                    <span>下一页</span> <HiChevronRight />
                </PaginationButton>
            </Buttons>
        </StyledPagination>
    )
}
