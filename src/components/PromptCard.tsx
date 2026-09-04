import '../styles/prompt-card.css';

interface PromptCardProps {
  title: string;
  artifact: string;
  instruction: string;
  rules?: string[];
  returns?: string[];
  guard?: string;
  eyebrow?: string;
  rulesLabel?: string;
  returnsLabel?: string;
}

export default function PromptCard({
  title,
  artifact,
  instruction,
  rules = [],
  returns = [],
  guard,
  eyebrow = 'Working prompt',
  rulesLabel = 'Instructions',
  returnsLabel = 'Return these fields',
}: PromptCardProps) {
  return (
    <aside className="prompt-card" aria-label={`${title} prompt`}>
      <header className="prompt-card__header">
        <span className="prompt-card__eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
        <p className="prompt-card__artifact">
          <span>Creates</span>
          <strong>{artifact}</strong>
        </p>
      </header>

      <div className="prompt-card__content">
        <section className="prompt-card__section prompt-card__section--lead">
          <h4>Give your agent this instruction</h4>
          <p>{instruction}</p>
        </section>

        {rules.length > 0 ? (
          <section className="prompt-card__section">
            <h4>{rulesLabel}</h4>
            <ul>
              {rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </section>
        ) : null}

        {returns.length > 0 ? (
          <section className="prompt-card__section">
            <h4>{returnsLabel}</h4>
            <ul className="prompt-card__returns">
              {returns.map((field) => <li key={field}>{field}</li>)}
            </ul>
          </section>
        ) : null}

        {guard ? (
          <section className="prompt-card__guard" aria-label="Hold condition">
            <strong>Hold condition</strong>
            <p>{guard}</p>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
