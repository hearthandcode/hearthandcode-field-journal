import '../styles/immutable-revision-chain.css';

export interface RevisionStep {
  kind: 'record' | 'review' | 'preview' | 'gate';
  label: string;
}

interface ImmutableRevisionChainProps {
  title: string;
  introduction: string;
  steps: RevisionStep[];
}

export default function ImmutableRevisionChain({
  title,
  introduction,
  steps,
}: ImmutableRevisionChainProps) {
  return (
    <figure className="immutable-revision-chain">
      <figcaption>
        <p className="immutable-revision-chain__kicker">Create-only succession</p>
        <h2>{title}</h2>
        <p>{introduction}</p>
      </figcaption>

      <ol className="immutable-revision-chain__rail">
        {steps.map((step, index) => (
          <li className="immutable-revision-chain__step" data-kind={step.kind} key={step.label}>
            <span className="immutable-revision-chain__number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p>Stage · {step.kind}</p>
            <h3>{step.label}</h3>
          </li>
        ))}
      </ol>

      <div className="immutable-revision-chain__retention">
        <span aria-hidden="true">◆</span>
        <p>
          <strong>Retention invariant:</strong> the accepted successor points back to revision 1;
          it never replaces it.
        </p>
      </div>
    </figure>
  );
}
