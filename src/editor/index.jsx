import Quill from "quill";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react"
// import "quill/dist/quill.core.css";

const QuillEditor = forwardRef(({
    readOnly, defaultValue, onTextChange, onSelectionChange, getCurrentValue
}, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
        onTextChangeRef.current = onTextChange;
        onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
        ref.current?.enable(!readOnly);
    }, [ref, readOnly]);

    useEffect(() => {
        const container = containerRef.current;
        const editorContainer = container.appendChild(
            container.ownerDocument.createElement('div'),
        );
        const quill = new Quill(editorContainer, {
            theme: 'snow',
            modules: {
                toolbar: false
            }
        });

        ref.current = quill;

        if (defaultValueRef.current) {
            quill.setContents(defaultValueRef.current);
        }

        quill.on(Quill.events.TEXT_CHANGE, (...args) => {
            onTextChangeRef.current?.(...args);
        });

        quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
            getCurrentValue(quill.getText(args[0].index, args[0].length))
            onSelectionChangeRef.current?.(...args);
        });

        return () => {
            ref.current = null;
            container.innerHTML = '';
        };
    }, [ref]);

    return <div ref={containerRef} />;
})

QuillEditor.displayName = 'Editor';

export default QuillEditor