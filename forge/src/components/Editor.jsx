import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import MenuBar from './MenuBar';
import SlashMenu from './SlashMenu';
import './Editor.css';

const Editor = ({ page, onUpdate }) => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [editingIcon, setEditingIcon] = useState(false);
  const [menuBarVisible, setMenuBarVisible] = useState(true);
  const [coverUrl, setCoverUrl] = useState(page.coverUrl || '');
  const titleRef = useRef(null);
  const lastScrollY = useRef(0);
  const updateTimeoutRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Heading ${node.attrs.level}`;
          }
          return "Type '/' for commands...";
        },
        showOnlyWhenEditable: true,
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color,
      TextStyle,
    ],
    content: page.content || '',
    onUpdate: ({ editor }) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        const html = editor.getHTML();
        onUpdate({ content: html });
      }, 500);
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === '/') {
          setTimeout(() => {
            const { from } = view.state.selection;
            const coords = view.coordsAtPos(from);
            const editorArea = document.querySelector('.editor-area');
            const editorRect = editorArea.getBoundingClientRect();
            
            setSlashMenuPosition({
              top: coords.bottom - editorRect.top + editorArea.scrollTop + 5,
              left: coords.left - editorRect.left + editorArea.scrollLeft,
            });
            setShowSlashMenu(true);
          }, 0);
        }
        
        if (event.key === 'Escape' && showSlashMenu) {
          setShowSlashMenu(false);
          return true;
        }

        if (event.ctrlKey || event.metaKey) {
          if (event.key === 'b') {
            event.preventDefault();
            editor?.chain().focus().toggleBold().run();
            return true;
          }
          if (event.key === 'i') {
            event.preventDefault();
            editor?.chain().focus().toggleItalic().run();
            return true;
          }
          if (event.key === 'u') {
            event.preventDefault();
            editor?.chain().focus().toggleUnderline().run();
            return true;
          }
        }
      },
    },
  });

  useEffect(() => {
    if (editor && page.content !== editor.getHTML()) {
      editor.commands.setContent(page.content || '');
    }
    setCoverUrl(page.coverUrl || '');
  }, [page._id, editor, page.content, page.coverUrl]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [page.title]);

  useEffect(() => {
    const editorArea = document.querySelector('.editor-area');
    if (!editorArea) return;

    const handleScroll = () => {
      const currentScrollY = editorArea.scrollTop;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setMenuBarVisible(false);
      } else {
        setMenuBarVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    editorArea.addEventListener('scroll', handleScroll);
    return () => editorArea.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTitleChange = (e) => {
    onUpdate({ title: e.target.value });
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editor?.commands.focus();
    }
  };

  const handleIconChange = (newIcon) => {
    if (newIcon && newIcon.length <= 2) {
      onUpdate({ icon: newIcon });
    }
    setEditingIcon(false);
  };

  const addCover = () => {
    const url = window.prompt('📷 Enter cover image URL:');
    if (url) {
      setCoverUrl(url);
      onUpdate({ coverUrl: url });
    }
  };

  const removeCover = () => {
    setCoverUrl('');
    onUpdate({ coverUrl: '' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="editor-container">
      {coverUrl && (
        <div className="page-cover" style={{ backgroundImage: `url(${coverUrl})` }}>
          <div className="cover-actions">
            <button onClick={addCover} className="cover-btn">Change cover</button>
            <button onClick={removeCover} className="cover-btn">Remove</button>
          </div>
        </div>
      )}

      {!coverUrl && (
        <button 
          onClick={addCover}
          style={{
            marginBottom: '16px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            fontSize: 14,
            color: '#6366f1',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
            e.target.style.color = 'white';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)';
            e.target.style.color = '#6366f1';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          📷 Add cover
        </button>
      )}

      <div className="page-header">
        <div className="page-icon-wrapper">
          {editingIcon ? (
            <input
              type="text"
              className="page-icon-input-large"
              defaultValue={page.icon}
              maxLength="2"
              autoFocus
              onBlur={(e) => handleIconChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleIconChange(e.target.value);
                if (e.key === 'Escape') setEditingIcon(false);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="page-icon-large"
              onClick={() => setEditingIcon(true)}
              title="Click to change icon"
            >
              {page.icon || '📄'}
            </div>
          )}
        </div>
      </div>

      <textarea
        ref={titleRef}
        className="page-title"
        placeholder="Untitled"
        value={page.title}
        onChange={handleTitleChange}
        onKeyDown={handleTitleKeyDown}
        rows="1"
      />

      <div className="page-meta">
        <span>Created {formatDate(page.createdAt)}</span>
        <span>•</span>
        <span>Edited {formatDate(page.updatedAt)}</span>
      </div>
      
      <MenuBar editor={editor} visible={menuBarVisible} />
      
      <div className="editor-wrapper">
        <EditorContent editor={editor} />
      </div>

      {showSlashMenu && (
        <SlashMenu
          editor={editor}
          position={slashMenuPosition}
          onClose={() => setShowSlashMenu(false)}
        />
      )}
    </div>
  );
};

export default Editor;