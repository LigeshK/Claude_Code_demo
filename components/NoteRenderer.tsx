import { type ReactNode } from 'react';

type Mark = { type: string };
type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: Mark[];
  text?: string;
};

function applyMarks(base: ReactNode, marks: Mark[], keyPrefix: string): ReactNode {
  return marks.reduce((node, mark, i) => {
    const key = `${keyPrefix}-m${i}`;
    switch (mark.type) {
      case 'bold':
        return (
          <strong key={key} className='font-semibold'>
            {node}
          </strong>
        );
      case 'italic':
        return <em key={key}>{node}</em>;
      case 'strike':
        return (
          <s key={key} className='text-gray-400'>
            {node}
          </s>
        );
      case 'code':
        return (
          <code key={key} className='bg-gray-100 px-1 py-0.5 rounded text-sm font-mono'>
            {node}
          </code>
        );
      default:
        return node;
    }
  }, base);
}

function renderNode(node: TipTapNode, index: number): ReactNode {
  const key = String(index);

  if (node.type === 'text') {
    const text: ReactNode = node.text ?? '';
    return node.marks?.length ? applyMarks(text, node.marks, key) : text;
  }

  const children = node.content?.map(renderNode) ?? [];

  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key} className='mb-2 leading-relaxed text-gray-800'>
          {children}
        </p>
      );
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 1;
      if (level === 1)
        return (
          <h1 key={key} className='text-2xl font-bold mb-4 text-gray-900'>
            {children}
          </h1>
        );
      if (level === 2)
        return (
          <h2 key={key} className='text-xl font-semibold mb-3 text-gray-900'>
            {children}
          </h2>
        );
      return (
        <h3 key={key} className='text-lg font-semibold mb-2 text-gray-900'>
          {children}
        </h3>
      );
    }
    case 'bulletList':
      return (
        <ul key={key} className='list-disc pl-5 mb-2 space-y-1'>
          {children}
        </ul>
      );
    case 'listItem':
      return (
        <li key={key} className='text-gray-800'>
          {children}
        </li>
      );
    case 'codeBlock':
      return (
        <pre key={key} className='bg-gray-100 rounded p-3 mb-3 overflow-x-auto'>
          <code className='text-sm font-mono'>{children}</code>
        </pre>
      );
    case 'horizontalRule':
      return <hr key={key} className='my-4 border-gray-200' />;
    default:
      return <>{children}</>;
  }
}

export default function NoteRenderer({ doc }: { doc: Record<string, unknown> }) {
  const root = doc as TipTapNode;
  return <>{root.content?.map(renderNode)}</>;
}
