import { autoUpdate, flip, FloatingFocusManager, FloatingList, FloatingNode, FloatingOverlay, FloatingPortal, FloatingTree, offset, safePolygon, shift, useClick, useDismiss, useFloating, useFloatingNodeId, useFloatingParentNodeId, useFloatingTree, useHover, useInteractions, useListItem, useListNavigation, useMergeRefs, useRole, useTypeahead } from "@floating-ui/react";
import { Children, cloneElement, createContext, forwardRef, isValidElement, useContext, useEffect, useRef, useState } from "react";

const MenuContext = createContext({
    getItemProps: () => ({}),
    activeIndex: null,
    setActiveIndex: () => { },
    setHasFocusInside: () => { },
    isOpen: false
})

export const MenuComponent = forwardRef(({ children, label, ...props }, forwardedRef) => {
    const [isOpen, setIsOpen] = useState(false)
    const [hasFocusInside, setHasFocusInside] = useState(false)
    const [activeIndex, setActiveIndex] = useState(null)

    const elementsRef = useRef([])
    const labelsRef = useRef(
        Children.map(children, (child) =>
            isValidElement(child) ? child.props.label : null
        )
    )
    const allowedMouseCloseRef = useRef(null)
    const parent = useContext(MenuContext)

    const tree = useFloatingTree()
    const nodeId = useFloatingNodeId()
    const parentId = useFloatingParentNodeId()
    const item = useListItem()

    const isNested = parentId != null

    const { floatingStyles, refs, context } = useFloating({
        nodeId,
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: isNested ? 'right-start' : 'bottom-start',
        middleware: [
            offset({
                mainAxis: isNested ? 0 : 5,
                alignmentAxis: isNested ? -4 : 4
            }),
            flip({
                fallbackPlacements: ['left-start']
            }),
            shift({ padding: isNested ? 0 : 10 })
        ],
        strategy: 'fixed',
        whileElementsMounted: autoUpdate
    })

    const hover = useHover(context, {
        enabled: isNested,
        delay: { open: 75 },
        handleClose: safePolygon({
            blockPointerEvents: true
        })
    })
    const click = useClick(context, {
        event: 'mousedown',
        toggle: !isNested,
        ignoreMouse: isNested
    })
    const role = useRole(context, { role: 'menu' })
    const dismiss = useDismiss(context, { bubbles: true })
    const listNavigation = useListNavigation(context, {
        listRef: elementsRef,
        activeIndex,
        nested: isNested,
        onNavigate: setActiveIndex
    })
    const typeHead = useTypeahead(context, {
        listRef: labelsRef,
        onMatch: isOpen ? setActiveIndex : undefined,
        activeIndex
    })

    const {
        getReferenceProps,
        getFloatingProps,
        getItemProps
    } = useInteractions([hover, click, role, dismiss, listNavigation, typeHead])

    // Event emitter allows you to communicate across tree components.
    // This effect closes all menus when an item gets clicked anywhere
    // in the tree.
    useEffect(() => {
        if (!tree) return;
        let timeout

        const handleTreeClick = () => {
            setIsOpen(false)
        }

        const onSubMenuOpen = (event) => {
            if (event.nodeId !== nodeId && event.parentId === parentId) {
                setIsOpen(false)
            }
        }

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

        tree.events.on('click', handleTreeClick)
        tree.events.on('menuopen', onSubMenuOpen)

        return () => {
            document.removeEventListener('contextmenu', onContextMenu)
            document.removeEventListener('mouseup', onMouseUp)
            tree.events.off('click', handleTreeClick)
            tree.events.off('menuopen', onSubMenuOpen)
            clearTimeout(timeout)
        }
    }, [tree, nodeId, parentId, refs])
    // useEffect(() => {
    //     if (!tree) return;

    //     const handleTreeClick = () => setIsOpen(false);
    //     const onSubMenuOpen = (event) => {
    //       if (event.nodeId !== nodeId && event.parentId === parentId) {
    //         setIsOpen(false);
    //       }
    //     };

    //     const onContextMenu = (e) => {
    //       e.preventDefault();
    //       // ... (setPositionReference logic remains the same)
    //     };

    //     // ... (onMouseUp remains the same)

    //     // Attach event listeners directly to the ref
    //     const refElement = refs.reference.current;
    //     if (refElement) {
    //       refElement.addEventListener('contextmenu', onContextMenu);
    //       refElement.addEventListener('mouseup', onMouseUp);
    //     }

    //     tree.events.on('click', handleTreeClick);
    //     tree.events.on('menuopen', onSubMenuOpen);

    //     return () => {
    //       if (refElement) {
    //         refElement.removeEventListener('contextmenu', onContextMenu);
    //         refElement.removeEventListener('mouseup', onMouseUp);
    //       }
    //       tree.events.off('click', handleTreeClick);
    //       tree.events.off('menuopen', onSubMenuOpen);
    //     };
    //   }, [tree, nodeId, parentId, refs]); 

    useEffect(() => {
        if (isOpen && tree) {
            tree.events.emit('menuopen', { parentId, nodeId })
        }
    }, [tree, isOpen, nodeId, parentId])

    return (
        <FloatingNode id={nodeId}>
            <button
                ref={useMergeRefs([refs.setReference, item.ref, forwardedRef])}
                tabIndex={
                    !isNested ? undefined : parent.activeIndex === item.index ? 0 : -1
                }
                role={isNested ? 'menuitem' : undefined}
                data-open={isOpen ? '' : undefined}
                data-nested={isNested ? '' : undefined}
                data-focus-inside={hasFocusInside ? '' : undefined}
                className={isNested ? 'MenuItem' : 'RootMenu'}
                style={!isNested ? {
                    // Add style to hide the div visually
                    position: 'absolute',
                    width: 0,
                    height: 0,
                    pointerEvents: 'none',
                    visibility: 'hidden',
                } : {}}
                {...getReferenceProps(
                    parent.getItemProps({
                        ...props,
                        onFocus(event) {
                            props.onFocus?.(event)
                            setHasFocusInside(false)
                            parent.setHasFocusInside(true)
                        }
                    })
                )}
            >
                {label}
                {isNested && (
                    <span aria-hidden style={{ marginLeft: 10, fontSize: 10 }}>
                        ▶
                    </span>
                )}
            </button>
            <MenuContext.Provider
                value={{
                    activeIndex,
                    setActiveIndex,
                    getItemProps,
                    setHasFocusInside,
                    isOpen
                }}
            >
                <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
                    {isOpen && (
                        <FloatingPortal>
                            <FloatingOverlay lockScroll>
                                <FloatingFocusManager
                                    context={context}
                                    modal={false}
                                    initialFocus={isNested ? -1 : 0}
                                    returnFocus={!isNested}
                                >
                                    <div
                                        ref={refs.setFloating}
                                        className="Menu"
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
                                                            elementsRef.current[index] = node
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
                        </FloatingPortal>
                    )}
                </FloatingList>
            </MenuContext.Provider>
        </FloatingNode>
    )
})

export const MenuItem = forwardRef(({ label, disabled, ...props }, forwardedRef) => {
    const menu = useContext(MenuContext)
    const item = useListItem({ label: disabled ? null : label })
    const tree = useFloatingTree()
    const isActive = item.index === menu.activeIndex

    return (
        <button
            {...props}
            ref={useMergeRefs([item.ref, forwardedRef])}
            type="button"
            role="menuitem"
            className="MenuItem"
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            {...menu.getItemProps({
                onClick(event) {
                    props.onClick?.(event)
                    tree?.events.emit("click")
                },
                onFocus(event) {
                    props.onFocus?.(event)
                    menu.setHasFocusInside(true)
                }
            })}
        >
            {label}
        </button>
    )
})

export const Menu = forwardRef((props, ref) => {
    const parentId = useFloatingParentNodeId()

    if (parentId === null) {
        return (
            <FloatingTree>
                <MenuComponent {...props} ref={ref} />
            </FloatingTree>
        )
    }

    return <MenuComponent {...props} ref={ref} />
})