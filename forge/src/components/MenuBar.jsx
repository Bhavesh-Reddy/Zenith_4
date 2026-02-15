import React from 'react';
import './MenuBar.css';

const MenuBar = ({ editor, visible = true }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('🔗 Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('🖼️ Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setTextColor = (e) => {
    editor.chain().focus().setColor(e.target.value).run();
  };

  const buttons = [
    { icon: '↶', title: 'Undo (Ctrl+Z)', action: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo() },
    { icon: '↷', title: 'Redo (Ctrl+Shift+Z)', action: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo() },
    { divider: true },
    { icon: 'B', title: 'Bold (Ctrl+B)', action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), style: { fontWeight: '800' } },
    { icon: 'I', title: 'Italic (Ctrl+I)', action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), style: { fontStyle: 'italic' } },
    { icon: 'U', title: 'Underline (Ctrl+U)', action: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive('underline'), style: { textDecoration: 'underline' } },
    { icon: 'S', title: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), style: { textDecoration: 'line-through' } },
    { icon: '</>', title: 'Code', action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code') },
    { divider: true },
    { icon: 'H1', title: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }) },
    { icon: 'H2', title: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
    { icon: 'H3', title: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }) },
    { divider: true },
    { icon: '•', title: 'Bullet list', action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList') },
    { icon: '1.', title: 'Numbered list', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList') },
    { icon: '☑', title: 'Task list', action: () => editor.chain().focus().toggleTaskList().run(), isActive: editor.isActive('taskList') },
    { divider: true },
    { icon: '💬', title: 'Quote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote') },
    { icon: '{}', title: 'Code block', action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive('codeBlock') },
    { icon: '—', title: 'Divider', action: () => editor.chain().focus().setHorizontalRule().run() },
    { divider: true },
    { icon: '🔗', title: 'Link', action: setLink, isActive: editor.isActive('link') },
    { icon: '🖼️', title: 'Image', action: addImage },
    { icon: '🎨', title: 'Text color', isColorPicker: true },
  ];

  return (
    <div className={`menu-bar-container ${!visible ? 'hidden' : ''}`}>
      <div className="menu-bar">
        {buttons.map((btn, index) => {
          if (btn.divider) {
            return <div key={`divider-${index}`} className="menu-divider" />;
          }

          if (btn.isColorPicker) {
            return (
              <div key={index} className="color-picker-wrapper">
                <label>
                  <input type="color" onChange={setTextColor} className="color-input" />
                  <button className="menu-btn color-btn" title={btn.title}>
                    {btn.icon}
                  </button>
                </label>
              </div>
            );
          }

          return (
            <button
              key={index}
              onClick={btn.action}
              disabled={btn.disabled}
              className={`menu-btn ${btn.isActive ? 'is-active' : ''}`}
              title={btn.title}
              style={btn.style}
            >
              {btn.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MenuBar;