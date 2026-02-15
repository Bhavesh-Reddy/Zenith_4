import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Search, Monitor, Info, AlertCircle, ZoomIn } from 'lucide-react';
import { searchImage } from '../services/api';
import './CircleSearch.css';

export default function CircleSearch({ onResult, onClose }) {
  const [phase, setPhase] = useState('intro');
  const [selection, setSelection] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const canvasRef = useRef(null);
  const screenshotRef = useRef(null);

  // ── Capture screen ──────────────────────────────────────────────────────────
  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        preferCurrentTab: false
      });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      stream.getTracks().forEach(t => t.stop());
      screenshotRef.current = bitmap;
      setPhase('drawing');
    } catch (err) {
      setErrorMsg(err.name === 'NotAllowedError'
        ? 'Permission denied. Please allow screen sharing.'
        : `Capture failed: ${err.message}`);
      setPhase('error');
    }
  }, []);

  // ── Init canvas with screenshot ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'drawing' || !screenshotRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bmp = screenshotRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawBase(canvas);
  }, [phase]);

  function drawBase(canvas) {
    const bmp = screenshotRef.current;
    if (!bmp || !canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    // Dim overlay
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ── Redraw selection box (Google Lens style) ────────────────────────────────
  const drawSelection = useCallback((sel) => {
    const canvas = canvasRef.current;
    const bmp = screenshotRef.current;
    if (!canvas || !bmp) return;
    const ctx = canvas.getContext('2d');

    // Redraw dimmed screenshot
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!sel || sel.w < 2 || sel.h < 2) return;

    const { x, y, w, h } = normalizeRect(sel);

    // Reveal selected area (cut through dim overlay)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    // Redraw that region from actual screenshot (sharp, not dimmed)
    ctx.save();
    ctx.drawImage(bmp, x, y, w, h, x, y, w, h);
    ctx.restore();

    // Animated border — Google Lens blue/gold style
    ctx.save();
    ctx.strokeStyle = '#C8963E';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Corner handles (thick)
    const cs = 18; // corner size
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Top-left
    ctx.beginPath(); ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(x, y + h - cs); ctx.lineTo(x, y + h); ctx.lineTo(x + cs, y + h); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(x + w - cs, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cs); ctx.stroke();

    // Size label
    ctx.fillStyle = 'rgba(200,150,62,0.9)';
    ctx.font = 'bold 11px DM Sans, sans-serif';
    ctx.textAlign = 'left';
    const label = `${Math.round(w)} × ${Math.round(h)}`;
    const labelX = x + 4;
    const labelY = y > 20 ? y - 6 : y + h + 14;
    ctx.fillText(label, labelX, labelY);

    ctx.restore();
  }, []);

  function normalizeRect(sel) {
    const x = sel.w < 0 ? sel.x + sel.w : sel.x;
    const y = sel.h < 0 ? sel.y + sel.h : sel.y;
    const w = Math.abs(sel.w);
    const h = Math.abs(sel.h);
    return { x, y, w, h };
  }

  function getCanvasPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    const pos = getCanvasPos(e);
    setStartPos(pos);
    setIsDrawing(true);
    setSelection(null);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDrawing || !startPos) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    const sel = { x: startPos.x, y: startPos.y, w: pos.x - startPos.x, h: pos.y - startPos.y };
    setSelection(sel);
    drawSelection(sel);
  }, [isDrawing, startPos, drawSelection]);

  const onMouseUp = useCallback((e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (!selection) return;
    const { x, y, w, h } = normalizeRect(selection);

    if (w < 20 || h < 20) {
      // Too small — show hint
      drawBase(canvasRef.current);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        const canvas = canvasRef.current;
        ctx.fillStyle = 'rgba(255,100,80,0.85)';
        ctx.font = 'bold 16px DM Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Selection too small — drag a bigger area', canvas.width / 2, canvas.height / 2);
      }
      setSelection(null);
      return;
    }

    cropSelection({ x, y, w, h });
  }, [isDrawing, selection, drawSelection]);

  // ── Crop selection from screenshot ─────────────────────────────────────────
  const cropSelection = useCallback(({ x, y, w, h }) => {
    const bmp = screenshotRef.current;
    const canvas = canvasRef.current;
    if (!bmp || !canvas) return;

    // Scale from canvas display coords → actual bitmap resolution
    const scaleX = bmp.width / canvas.width;
    const scaleY = bmp.height / canvas.height;

    const bx = Math.max(0, x * scaleX);
    const by = Math.max(0, y * scaleY);
    const bw = Math.min(w * scaleX, bmp.width - bx);
    const bh = Math.min(h * scaleY, bmp.height - by);

    const crop = document.createElement('canvas');
    crop.width = Math.max(1, bw);
    crop.height = Math.max(1, bh);
    const ctx = crop.getContext('2d');
    ctx.drawImage(bmp, -bx, -by, bmp.width, bmp.height);

    setCroppedImage(crop.toDataURL('image/png'));
    setPhase('query');
  }, []);

  // ── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!croppedImage) return;
    setPhase('processing');
    try {
      const data = await searchImage(croppedImage, query || 'What is this?');
      const responseText = data.response || data.caption || 'No description available.';
      setResult(responseText);
      setPhase('done');
      onResult?.(responseText, croppedImage, query || 'Circle to Search');
    } catch (err) {
      setErrorMsg(err.message || 'Search failed');
      setPhase('error');
    }
  };

  const reset = () => {
    setPhase('intro');
    setSelection(null);
    setCroppedImage(null);
    setQuery('');
    setResult('');
    setErrorMsg('');
    screenshotRef.current = null;
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Render ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div className="circle-search-modal">
      <div className="circle-search-panel animate-scale-in">
        <button className="circle-close-btn" onClick={onClose}><X size={18} /></button>
        <div className="circle-intro">
          <div className="circle-intro-icon"><ZoomIn size={32} /></div>
          <h2>Lens Search</h2>
          <p>Capture any tab or window, select an area like Google Lens, and ask ZenM about it.</p>
          <div className="circle-how">
            {[
              'Click "Share Screen" below',
              'Pick any tab or window from the popup',
              'Click and drag to draw a selection box',
              'Type your question and get AI answer'
            ].map((s, i) => (
              <div key={i} className="circle-step"><span>{i + 1}</span>{s}</div>
            ))}
          </div>
          <div className="circle-note">
            <AlertCircle size={14} />
            <span>Works across all tabs and windows. Your screen is never recorded — only one frame is captured.</span>
          </div>
          <button className="circle-start-btn" onClick={startCapture}>
            <Monitor size={16} /> Share Screen & Start
          </button>
        </div>
      </div>
    </div>
  );

  if (phase === 'drawing') return (
    <div className="circle-search-fullscreen">
      <canvas
        ref={canvasRef}
        className="circle-canvas"
        style={{ cursor: 'crosshair' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
      {/* Floating toolbar */}
      <div className="lens-toolbar">
        <span className="lens-hint">
          {isDrawing ? 'Release to select' : selection ? 'Drag to re-select' : 'Click and drag to select an area'}
        </span>
        {selection && !isDrawing && (
          <button className="lens-confirm-btn" onClick={() => {
            const { x, y, w, h } = normalizeRect(selection);
            cropSelection({ x, y, w, h });
          }}>
            <Search size={14} /> Search this area
          </button>
        )}
        <button className="lens-cancel-btn" onClick={onClose}><X size={14} /> Cancel</button>
      </div>
    </div>
  );

  if (phase === 'query') return (
    <div className="circle-search-modal">
      <div className="circle-search-panel animate-scale-in">
        <button className="circle-close-btn" onClick={onClose}><X size={18} /></button>
        <h3 className="circle-panel-title">What do you want to know?</h3>
        {croppedImage && (
          <div className="circle-preview-wrap">
            <img src={croppedImage} alt="Selected area" className="circle-preview" />
          </div>
        )}
        <div className="circle-query-row">
          <input
            type="text"
            placeholder="Ask about this area... (Enter to search)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="circle-query-input"
            autoFocus
          />
          <button className="circle-search-btn" onClick={handleSearch}><Search size={16} /></button>
        </div>
        <button className="circle-retry-btn" onClick={reset}>← Capture again</button>
      </div>
    </div>
  );

  if (phase === 'processing') return (
    <div className="circle-search-modal">
      <div className="circle-search-panel animate-scale-in">
        <div className="circle-loading">
          <div className="circle-spinner" />
          <p>Analysing your selection...</p>
        </div>
      </div>
    </div>
  );

  if (phase === 'done') return (
    <div className="circle-search-modal">
      <div className="circle-search-panel animate-scale-in">
        <button className="circle-close-btn" onClick={onClose}><X size={18} /></button>
        <h3 className="circle-panel-title">Result added to chat ✓</h3>
        {croppedImage && <img src={croppedImage} alt="Selected" className="circle-preview" />}
        <p className="circle-result-text">{result}</p>
        <div className="circle-done-actions">
          <button className="circle-retry-btn" onClick={reset}>Search again</button>
          <button className="circle-close-done-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  if (phase === 'error') return (
    <div className="circle-search-modal">
      <div className="circle-search-panel animate-scale-in">
        <button className="circle-close-btn" onClick={onClose}><X size={18} /></button>
        <div className="circle-error">
          <Info size={28} />
          <p>{errorMsg}</p>
          <button className="circle-retry-btn" onClick={reset}>Try again</button>
        </div>
      </div>
    </div>
  );

  return null;
}