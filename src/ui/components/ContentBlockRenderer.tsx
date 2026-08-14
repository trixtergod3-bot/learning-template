import type { ContentBlock } from '@/engine/domain/content';

interface ContentBlockRendererProps {
  blocks: readonly ContentBlock[];
}

export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  return (
    <div className="content-blocks">
      {blocks.map((block, index) => {
        const key = `${block.kind}-${index}`;

        switch (block.kind) {
          case 'heading': {
            if (block.level === 2) return <h2 key={key}>{block.text}</h2>;
            if (block.level === 3) return <h3 key={key}>{block.text}</h3>;
            return <h4 key={key}>{block.text}</h4>;
          }
          case 'paragraph':
            return <p key={key}>{block.text}</p>;
          case 'list': {
            const List = block.style === 'ordered' ? 'ol' : 'ul';
            return (
              <List key={key}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </List>
            );
          }
          case 'key-facts':
            return (
              <dl className="key-facts" key={key}>
                {block.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            );
          case 'callout':
            return (
              <aside className={`callout callout--${block.tone}`} key={key}>
                {block.content}
              </aside>
            );
          case 'image':
            return (
              <figure key={key}>
                <img alt={block.alt} src={block.src} />
                {block.caption ? <figcaption>{block.caption}</figcaption> : null}
              </figure>
            );
          case 'example':
          case 'worked-example':
            return (
              <section className="worked-example" key={key}>
                {block.title ? <h3>{block.title}</h3> : null}
                <ol>
                  {block.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>
            );
          case 'table':
            return (
              <div className="table-wrap" key={key}>
                <table>
                  <thead>
                    <tr>
                      {block.columns.map((column) => (
                        <th key={column} scope="col">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'quote':
            return (
              <figure className="quote" key={key}>
                <blockquote>{block.text}</blockquote>
                {block.attribution ? <figcaption>— {block.attribution}</figcaption> : null}
              </figure>
            );
        }
      })}
    </div>
  );
}
