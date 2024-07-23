import { autoUpdate, flip, FloatingFocusManager, FloatingOverlay, FloatingPortal, offset, shift, useDismiss, useFloating, useInteractions, useListNavigation, useRole, useTypeahead } from "@floating-ui/react"
import { cloneElement, useEffect, useRef } from "react"
import { isValidElement } from "react"
import { Children } from "react"
import { useState } from "react"

const Menu = ({ children }) => {
    const [activeIndex, setActiveIndex] = useState(null)
    const [isOpen, setIsOpen] = useState(null)

    const listItemRef = useRef([])
    const listContentRef = useRef(
        Children.map(children, (child) =>
            isValidElement(child) ? child.props.label : null
        )
    )
    const allowedMouseCloseRef = useRef(null)

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [
            offset({ mainAxis: 5, alignmentAxis: 4 }),
            flip({
                fallbackPlacements: ['left-start']
            }),
            shift({ padding: 10 })
        ],
        placement: 'right-start',
        strategy: 'fixed',
        whileElementsMounted: autoUpdate
    })

    const role = useRole(context, { role: 'menu' })
    const dismiss = useDismiss(context)
    const listNavigation = useListNavigation(context, {
        listRef: listItemRef,
        onNavigate: setActiveIndex,
        activeIndex
    })
    const typeHead = useTypeahead(context, {
        enabled: isOpen,
        listRef: listContentRef,
        onMatch: setActiveIndex,
        activeIndex
    })

    const { getFloatingProps, getItemProps } = useInteractions([
        role,
        dismiss,
        listNavigation,
        typeHead
    ])

    useEffect(() => {
        let timeout

        const onContextMenu = (e) => {
            e.preventDefault()

            refs.setPositionReference({
                getBoundingClientRect() {
                    return {
                        width: 0,
                        height: 0,
                        x: e.clientX,
                        y: e.clientY,
                        top: e.clientY,
                        right: e.clientX,
                        bottom: e.clientY,
                        left: e.clientX
                    }
                }
            })

            setIsOpen(true)
            clearTimeout(timeout)

            allowedMouseCloseRef.current = false
            timeout = setTimeout(() => {
                allowedMouseCloseRef.current = true
            }, 300)
        }

        const onMouseUp = () => {
            if (allowedMouseCloseRef.current) {
                setIsOpen(false)
            }
        }

        document.addEventListener('contextmenu', onContextMenu)
        document.addEventListener('mouseup', onMouseUp)
        return () => {
            document.removeEventListener('contextmenu', onContextMenu)
            document.removeEventListener('mouseup', onMouseUp)
            clearTimeout(timeout)
        }
    }, [refs])

    return (
        <FloatingPortal>
            {isOpen && (
                <FloatingOverlay lockScroll>
                    <FloatingFocusManager context={context} initialFocus={refs.floating}>
                        <div
                            className="bg-[#242424] border border-solid border-[#ddd] shadow-sm p-1 rounded-lg outline-0"
                            ref={refs.setFloating}
                            style={floatingStyles}
                            {...getFloatingProps()}
                        >
                            {Children.map(
                                children,
                                (child, index) =>
                                    isValidElement(child) && cloneElement(
                                        child,
                                        getItemProps({
                                            tabIndex: activeIndex === index ? 0 : -1,
                                            ref(node) {
                                                listItemRef.current[index] = node
                                            },
                                            onClick() {
                                                child.props.onClick?.()
                                                setIsOpen(false)
                                            },
                                            onMouseUp() {
                                                child.props.onClick?.()
                                                setIsOpen(false)
                                            }
                                        })
                                    )
                            )}
                        </div>
                    </FloatingFocusManager>
                </FloatingOverlay>
            )}
        </FloatingPortal>
    )
}

export default Menu