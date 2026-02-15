import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './SlashMenu.css';

const SlashMenu = ({ editor, position, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const menuItems = useMemo(() => [
    { icon: '📝', title: 'Text', shortcut: 'text', description: 'Plain text', action: () => editor.chain().focus().setParagraph().run() },
    { icon: '✅', title: 'To-do list', shortcut: '[]', description: 'Track tasks', action: () => editor.chain().focus().toggleTaskList().run() },
    { icon: '💎', title: 'Heading 1', shortcut: '#', description: 'Big heading', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { icon: '💠', title: 'Heading 2', shortcut: '##', description: 'Medium heading', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: '🔹', title: 'Heading 3', shortcut: '###', description: 'Small heading', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { icon: '🔥', title: 'Bulleted list', shortcut: '-', description: 'Simple list', action: () => editor.chain().focus().toggleBulletList().run() },
    { icon: '🎯', title: 'Numbered list', shortcut: '1.', description: 'Numbered list', action: () => editor.chain().focus().toggleOrderedList().run() },
    { icon: '💬', title: 'Quote', shortcut: '>', description: 'Capture a quote', action: () => editor.chain().focus().toggleBlockquote().run() },
    { icon: '💻', title: 'Code', shortcut: '```', description: 'Code snippet', action: () => editor.chain().focus().toggleCodeBlock().run() },
    { icon: '➖', title: 'Divider', shortcut: '---', description: 'Visual divider', action: () => editor.chain().focus().setHorizontalRule().run() },
    { icon: '🖼️', title: 'Image', shortcut: 'img', description: 'Upload or embed', action: () => { const url = window.prompt('🖼️ Image URL:'); if (url) editor.chain().focus().setImage({ src: url }).run(); } },
    { icon: '🔗', title: 'Link', shortcut: 'link', description: 'Add a link', action: () => { const url = window.prompt('🔗 URL:'); if (url) editor.chain().focus().setLink({ href: url }).run(); } },
  ], [editor]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % menuItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      menuItems[selectedIndex].action();
      onClose();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [selectedIndex, menuItems, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleItemClick = (item) => {
    item.action();
    onClose();
  };

  return (
    <>
      <div className="slash-menu-backdrop" onClick={onClose} />
      <div className="slash-menu" style={{ top: position.top, left: position.left }}>
        <div className="slash-menu-header">
          <span className="slash-menu-title">Basic Blocks</span>
        </div>
        <div className="slash-menu-section">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`slash-menu-item ${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="menu-item-icon">{item.icon}</span>
              <div className="menu-item-content">
                <div className="menu-item-title">
                  {item.title}
                  {item.shortcut && <span className="menu-item-shortcut">{item.shortcut}</span>}
                </div>
                <div className="menu-item-description">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SlashMenu;