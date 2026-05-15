'use client';

import { useEffect, useRef, useState } from 'react';

const PROMPT_HTML = '<span class="tok-prompt">user@bash</span><span class="tok-output">:</span><span class="tok-url">~/web-app</span><span class="tok-output">$</span>';

function esc(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export default function TerminalAnimation() {
  const codeBodyRef = useRef<HTMLPreElement>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    const codeBody = codeBodyRef.current;
    if (!codeBody) return;

    let lines: string[] = [];
    let isRunning = true;

    function flush() {
      if (!isRunning) return;
      setContent(lines.join('\n') + '<span class="tok-cursor"> </span>');
      if (codeBody) {
        codeBody.scrollTop = codeBody.scrollHeight;
      }
    }

    async function typeCmd(cmd: string) {
      lines.push('');
      const idx = lines.length - 1;
      let typed = '';
      const typoAt = Math.floor(cmd.length * 0.45 + Math.random() * cmd.length * 0.25);
      const wrongChar = 'qwrtypsdfghjklzxcvbnm'[Math.floor(Math.random() * 21)];
      let typoInserted = false;

      for (let i = 0; i < cmd.length; i++) {
        if (!isRunning) return;
        if (i === typoAt && !typoInserted) {
          typoInserted = true;
          typed += wrongChar;
          lines[idx] = `${PROMPT_HTML} <span class="tok-cmd">${esc(typed)}</span>`;
          flush();
          await sleep(80 + Math.random() * 60);
          await sleep(220 + Math.random() * 180);
          typed = typed.slice(0, -1);
          lines[idx] = `${PROMPT_HTML} <span class="tok-cmd">${esc(typed)}</span>`;
          flush();
          await sleep(60);
        }
        typed += cmd[i];
        lines[idx] = `${PROMPT_HTML} <span class="tok-cmd">${esc(typed)}</span>`;
        flush();
        let delay = 55 + Math.random() * 55;
        if (' /-_.'.includes(cmd[i])) delay += 30;
        if (i > 0 && cmd[i - 1] === ' ')  delay += 20;
        await sleep(delay);
      }
      await sleep(300 + Math.random() * 200);
    }

    async function out(text: string, cls = 'tok-output', delay = 40) {
      if (!isRunning) return;
      await sleep(delay);
      lines.push(cls ? `<span class="${cls}">${esc(text)}</span>` : esc(text));
      flush();
    }

    async function progress(label: string, steps = 30, stepMs = 35) {
      lines.push('');
      const idx = lines.length - 1;
      for (let i = 0; i <= steps; i++) {
        if (!isRunning) return;
        const pct  = Math.round((i / steps) * 100);
        const fill = '█'.repeat(i);
        const empty = '░'.repeat(steps - i);
        lines[idx] =
          `  <span class="tok-warn">${esc(label.padEnd(12))}</span>` +
          `<span class="tok-success">${fill}</span>` +
          `<span class="tok-comment">${empty}</span>` +
          `  <span class="tok-prompt">${String(pct).padStart(3)}%</span>`;
        flush();
        await sleep(stepMs + Math.random() * 20);
      }
      await sleep(100);
    }

    async function blankLine() {
      if (!isRunning) return;
      lines.push('');
      flush();
      await sleep(30);
    }

    async function runScript() {
      lines = [];
      flush();
      await sleep(600);
      await typeCmd('node -v');
      await out('v20.11.0', 'tok-success', 120);
      await blankLine();
      await typeCmd('npm install');
      await progress('Installing', 32, 30);
      await out('added 214 packages in 4.2s', 'tok-output', 80);
      await blankLine();
      await typeCmd('npm run dev');
      await out('  VITE v5.2.0  ready in 312 ms', 'tok-success', 80);
      await blankLine();
      await out('  ➜  Local:   http://localhost:5173/', 'tok-url', 50);
      await blankLine();
      lines.push(`${PROMPT_HTML} `);
      flush();
      await sleep(3500);
      if (isRunning) runScript();
    }

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        io.disconnect();
        runScript();
      }
    }, { threshold: 0.25 });

    io.observe(codeBody);

    return () => {
      isRunning = false;
      io.disconnect();
    };
  }, []);

  return (
    <pre
      className="code-body"
      ref={codeBodyRef}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
