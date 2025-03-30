import { createContext, useContext, useState } from 'react'

const LayoutContext = createContext()

function LayoutProvider({ children }) {
    const [isNavbarOnTop, setIsNavbarOnTop] = useState(true)

    function toggleNavbarPosition() {
        setIsNavbarOnTop((position) => !position)
    }

    return (
        <LayoutContext.Provider value={{ isNavbarOnTop, toggleNavbarPosition }}>
            {children}
        </LayoutContext.Provider>
    )
}

function useLayout() {
    const context = useContext(LayoutContext)
    if (context === undefined)
        throw new Error('useLayout must be used within a LayoutProvider')
    return context
}

export { LayoutProvider, useLayout }
