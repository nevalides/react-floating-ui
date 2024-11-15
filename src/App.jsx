import { Delta } from "quill/core";
// import Menu from "./custom-context-menu";
// import MenuItem from "./custom-context-menu/MenuItem";
import QuillEditor from './editor'
import { useRef, useState } from "react";
import "quill/dist/quill.core.css";
// import { Menu, MenuItem } from "./dropdown-menu";
import { Menu, MenuItem } from "./custom-context-menu/NestedMenu/NestedCustomContextMenu";
import { TextConverterToMarkUp } from "./helper";

const App = () => {
  const [range, setRange] = useState();
  const [lastChange, setLastChange] = useState();
  const [currentValue, setCurrentValue] = useState();
  const [contentText, setContentText] = useState();
  const [readOnly, setReadOnly] = useState(false);

  const quillRef = useRef();

  const handleBold = () => {
    if (!quillRef.current.getSelection()) return;

    const { index, length } = quillRef.current.getSelection()
    if (index === -1 || length < 0) {
      return;
    } else {
      const currentFormat = quillRef.current.getFormat(index, length)
      quillRef.current.formatText(index, length, 'bold', !currentFormat.bold)
    }
  }

  const handleItalic = () => {
    if (!quillRef.current.getSelection()) return;

    const { index, length } = quillRef.current.getSelection()
    if (index === -1 || length < 0) {
      return;
    } else {
      const currentFormat = quillRef.current.getFormat(index, length)
      quillRef.current.formatText(index, length, 'italic', !currentFormat.italic)
    }
  }

  const handleUnderline = () => {
    if (!quillRef.current.getSelection()) return;

    const { index, length } = quillRef.current.getSelection()
    if (index === -1 || length < 0) {
      return;
    } else {
      const currentFormat = quillRef.current.getFormat(index, length)
      quillRef.current.formatText(index, length, 'underline', !currentFormat.underline)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="font-sans text-center">Floating UI Context Menu for RichText Editor</h1>
      <br />
      <QuillEditor
        ref={quillRef}
        readOnly={readOnly}
        defaultValue={new Delta()
          .insert('Hello')
          .insert('\n', { header: 1 })
          .insert('Some ')
          .insert('initial', { bold: true })
          .insert(' ')
          .insert('content', { underline: true })
          .insert('\n')}
        getCurrentValue={setCurrentValue}
        onSelectionChange={setRange}
        onTextChange={setLastChange}
      />
      <div className="flex border border-t-0 border-solid border-gray-300 p-2">
        <label>
          Read Only:{' '}
          <input
            type="checkbox"
            value={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
        </label>
        <button
          className="ml-auto"
          type="button"
          onClick={() => {
            console.log(TextConverterToMarkUp(quillRef.current.getContents()));
            setContentText(TextConverterToMarkUp(quillRef.current.getContents()))
          }}
        >
          Get Content (Log + html)
        </button>
      </div>
      <div className="my-2 font-mono">
        <div className="text-gray-500 uppercase">Current Range:</div>
        {range ? JSON.stringify(range) : 'Empty'}
      </div>
      <div className="my-2 font-mono">
        <div className="text-gray-500 uppercase">Last Change:</div>
        {lastChange ? JSON.stringify(lastChange.ops) : 'Empty'}
      </div>
      <div className="my-2 font-mono">
        <div className="text-gray-500 uppercase">Selected Text:</div>
        {currentValue ? currentValue : 'Empty'}
      </div>
      <div className="my-2 font-mono">
        <div className="text-gray-500 uppercase">Text in HTML:</div>
        {contentText ? contentText : 'Empty'}
      </div>

      {/* custom context menu */}
      {/* <Menu quillEdit={quillRef}>
        <MenuItem label="Bold" disabled={!currentValue} onClick={handleBold} />
        <MenuItem label="Italic" disabled={!currentValue} onClick={handleItalic} />
        <MenuItem label="Underline" disabled={!currentValue} onClick={handleUnderline} />
        <MenuItem label="Save As..." />
        <MenuItem label="Print" />
      </Menu> */}

      {/* dropdown menu with submenu */}
      {/* <Menu label="Edit">
        <MenuItem label="Undo" onClick={() => console.log("Undo")} />
        <MenuItem label="Redo" disabled />
        <MenuItem label="Cut" />
        <Menu label="Copy as">
          <MenuItem label="Text" />
          <MenuItem label="Video" />
          <Menu label="Image">
            <MenuItem label=".png" />
            <MenuItem label=".jpg" />
            <MenuItem label=".svg" />
            <MenuItem label=".gif" />
          </Menu>
          <MenuItem label="Audio" />
        </Menu>
        <Menu label="Share">
          <MenuItem label="Mail" />
          <MenuItem label="Instagram" />
        </Menu>
      </Menu> */}

      {/* nested custom context menu */}
      <Menu>
        <Menu label='styling'>
          <MenuItem label='bold' onClick={handleBold} />
          <MenuItem label='italic' onClick={handleItalic} />
          <MenuItem label='underline' onClick={handleUnderline} />
        </Menu>
        <MenuItem label='reload' disabled />
        <MenuItem label='save as' />
        <MenuItem label='print' />
      </Menu>
    </div >
  )
}

export default App
