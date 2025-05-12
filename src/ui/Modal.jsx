import styled from 'styled-components'
import PropTypes from 'prop-types'
import { HiXMark } from 'react-icons/hi2'
import { createPortal } from 'react-dom'
import { cloneElement, createContext, useContext, useState } from 'react'
import useOutsideClick from '../hooks/useOutsideClick'

const StyledModal = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--color-grey-0);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 3.2rem 4rem;
    transition: all 0.5s;
`

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: var(--backdrop-color);
    backdrop-filter: blur(4px);
    z-index: 1000;
    transition: all 0.5s;
`

const Button = styled.button`
    background: none;
    border: none;
    padding: 0.4rem;
    border-radius: var(--border-radius-sm);
    transform: translateX(0.8rem);
    transition: all 0.2s;
    position: absolute;
    top: 1.2rem;
    right: 1.9rem;

    &:hover {
        background-color: var(--color-grey-100);
    }

    & svg {
        width: 2.4rem;
        height: 2.4rem;
        /* Sometimes we need both */
        /* fill: var(--color-grey-500);
    stroke: var(--color-grey-500); */
        color: var(--color-grey-500);
    }
`

// compound component version
const ModalContext = createContext()

function Modal({ children }) {
    const [openName, setOpenName] = useState('')

    const close = () => setOpenName('')
    const open = setOpenName

    return (
        <ModalContext.Provider value={{ openName, close, open }}>
            {children}
        </ModalContext.Provider>
    )
}

function Open({ children, opens: opensWindowName }) {
    const context = useContext(ModalContext)

    if (!context) {
        throw new Error('Modal.Open 组件必须在 Modal 组件内部使用')
    }

    const { open } = context

    return (
        <>{cloneElement(children, { onClick: () => open(opensWindowName) })}</>
    )
}

function Window({ children, name }) {
    const context = useContext(ModalContext)

    if (!context) {
        throw new Error('Modal.Window 组件必须在 Modal 组件内部使用')
    }

    const { openName, close } = context

    // custom hook
    const ref = useOutsideClick(close, true)

    if (name !== openName) return null

    // interesting function
    return createPortal(
        <Overlay>
            <StyledModal ref={ref}>
                <Button onClick={close}>
                    <HiXMark />
                </Button>
                <div>{cloneElement(children, { onCloseModal: close })}</div>
            </StyledModal>
        </Overlay>,
        document.body
    )
}
Modal.propTypes = {
    children: PropTypes.node, // 验证 children
    onClose: PropTypes.func, // 验证 onClose
}

Open.propTypes = {
    children: PropTypes.node, // 验证 children
    opens: PropTypes.string, // 验证 opens
}

Window.propTypes = {
    children: PropTypes.node, // 验证 children
    name: PropTypes.string, // 验证 name
}

Modal.Open = Open
Modal.Window = Window

export default Modal
