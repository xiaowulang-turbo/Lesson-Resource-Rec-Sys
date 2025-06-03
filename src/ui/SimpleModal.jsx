import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { createPortal } from 'react-dom'
import { HiXMark } from 'react-icons/hi2'
import PropTypes from 'prop-types'

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: var(--backdrop-color, rgba(0, 0, 0, 0.3));
    backdrop-filter: blur(4px);
    z-index: 1000;
    transition: all 0.5s;
    display: flex;
    justify-content: center;
    align-items: center;
`

const StyledModal = styled.div`
    background-color: var(--color-grey-0, white);
    border-radius: var(--border-radius-lg, 8px);
    box-shadow: var(--shadow-lg, 0 24px 32px -8px rgba(0, 0, 0, 0.2));
    padding: 3.2rem 4rem;
    max-width: 80%;
    max-height: 90vh;
    overflow-y: auto;
    width: ${(props) => props.width || 'auto'};
    position: relative;
`

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.4rem;
`

const Title = styled.h3`
    font-size: 2rem;
    font-weight: 600;
    color: var(--color-grey-900, #111827);
    margin: 0;
`

const CloseButton = styled.button`
    background: none;
    border: none;
    padding: 0.4rem;
    border-radius: var(--border-radius-sm, 4px);
    transition: all 0.2s;
    position: absolute;
    top: 1.6rem;
    right: 2rem;
    cursor: pointer;

    &:hover {
        background-color: var(--color-grey-100, #f3f4f6);
    }

    & svg {
        width: 2.4rem;
        height: 2.4rem;
        color: var(--color-grey-500, #6b7280);
    }
`

function Modal({ isOpen, onClose, title, children, width }) {
    const modalRef = useRef(null)

    useEffect(() => {
        function handleEscape(e) {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose()
        }
    }

    if (!isOpen) return null

    return createPortal(
        <Overlay onClick={handleOverlayClick}>
            <StyledModal ref={modalRef} width={width}>
                <ModalHeader>
                    <Title>{title}</Title>
                    <CloseButton onClick={onClose}>
                        <HiXMark />
                    </CloseButton>
                </ModalHeader>
                <div>{children}</div>
            </StyledModal>
        </Overlay>,
        document.body
    )
}

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    width: PropTypes.string,
}

export default Modal
