import '../styles/governed-agent-loop.css';

export interface AgentLoopStage {
  kind: string;
  label: string;
}

interface GovernedAgentLoopProps {
  title: string;
  introduction: string;
  stages: AgentLoopStage[];
  returnLabel: string;
}

export default function GovernedAgentLoop({
  title,
  introduction,
  stages,
  returnLabel,
}: GovernedAgentLoopProps) {
  return (
    <figure className="governed-agent-loop">
      <figcaption>
        <p className="governed-agent-loop__kicker">Eight-state governed loop</p>
        <h2>{title}</h2>
        <p>{introduction}</p>
      </figcaption>

      <div className="governed-agent-loop__orbit">
        <div className="governed-agent-loop__ring" aria-hidden="true" />
        {stages.map((_, index) => (
          <span
            className="governed-agent-loop__arrow"
            data-position={index + 1}
            aria-hidden="true"
            key={`arrow-${index + 1}`}
          >
            →
          </span>
        ))}
        <ol className="governed-agent-loop__stages">
        {stages.map((stage, index) => (
          <li
            className="governed-agent-loop__stage"
            data-position={index + 1}
            key={`${stage.kind}-${stage.label}`}
          >
            <span className="governed-agent-loop__number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p>Stage · {stage.kind}</p>
            <h3>{stage.label}</h3>
          </li>
        ))}
        </ol>

        <div className="governed-agent-loop__center">
          <span aria-hidden="true">↺</span>
          <strong>Evidence return</strong>
          <p>{returnLabel}</p>
        </div>
      </div>

      <p className="governed-agent-loop__fallback">
        <strong>Return rule:</strong> observation becomes evidence for human interpretation and
        may inform a later source revision; it never rewrites the initiating source automatically.
      </p>
    </figure>
  );
}
