import { Fragment } from 'react';
import type { ReactNode } from 'react';

// Minimal markdown-lite renderer for problem statements: paragraphs,
// "- " bullet lists, "1. " ordered lists, plus **bold** and `code`
// inline. It builds React nodes from plain strings and never injects
// raw HTML, so problem text cannot break the page or run scripts.
const renderInline = (text: string, keyPrefix: string): ReactNode[] => {
  const codeSplit = text.split(/(`[^`]*`)/g);
  return codeSplit.map((part, i) => {
    if (part.length >= 2 && part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={`${keyPrefix}-c${i}`}
          className="rounded-[2px] border border-[var(--paper-line)] bg-[#f6f0df] px-1 font-paper-mono text-[12.5px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const boldSplit = part.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Fragment key={`${keyPrefix}-t${i}`}>
        {boldSplit.map((chunk, j) =>
          chunk.length >= 4 && chunk.startsWith('**') && chunk.endsWith('**') ? (
            <strong key={j} className="font-bold text-[var(--paper-ink)]">
              {chunk.slice(2, -2)}
            </strong>
          ) : (
            chunk
          ),
        )}
      </Fragment>
    );
  });
};

const joinLines = (lines: string[], keyPrefix: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  lines.forEach((line, i) => {
    if (i > 0) nodes.push(<br key={`${keyPrefix}-br${i}`} />);
    nodes.push(...renderInline(line, `${keyPrefix}-l${i}`));
  });
  return nodes;
};

const isBullet = (line: string) => /^\s*[-*] /.test(line);
const isOrdered = (line: string) => /^\s*\d+[.)] /.test(line);
const stripMarker = (line: string) => line.replace(/^\s*(?:[-*]|\d+[.)]) /, '');

export const RichInline = ({ text }: { text: string }) => <>{renderInline(text, 'inline')}</>;

const RichText = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let listItems: string[][] = [];
  let listKind: 'ul' | 'ol' | null = null;

  const flushPara = () => {
    if (para.length > 0) {
      const key = blocks.length;
      blocks.push(<p key={key}>{joinLines(para, `p${key}`)}</p>);
      para = [];
    }
  };

  const flushList = () => {
    if (listKind && listItems.length > 0) {
      const key = blocks.length;
      const items = listItems.map((itemLines, i) => (
        <li key={i} className="leading-[1.6]">
          {joinLines(itemLines, `b${key}-i${i}`)}
        </li>
      ));
      blocks.push(
        listKind === 'ul' ? (
          <ul key={key} className="list-disc space-y-1 pl-5">
            {items}
          </ul>
        ) : (
          <ol key={key} className="list-decimal space-y-1 pl-5">
            {items}
          </ol>
        ),
      );
      listItems = [];
      listKind = null;
    }
  };

  lines.forEach((line) => {
    if (line.trim() === '') {
      flushPara();
      flushList();
      return;
    }
    const kind: 'ul' | 'ol' | null = isBullet(line) ? 'ul' : isOrdered(line) ? 'ol' : null;
    if (kind) {
      flushPara();
      if (listKind !== kind) flushList();
      listKind = kind;
      listItems.push([stripMarker(line)]);
      return;
    }
    if (listKind) {
      const current = listItems[listItems.length - 1];
      current.push(line.trim());
      return;
    }
    para.push(line);
  });
  flushPara();
  flushList();

  return <div className="space-y-2.5">{blocks}</div>;
};

export default RichText;
