import '../styles/human-gate-circuit.css';

interface HumanGateCircuitProps {
  title: string;
  candidate: string;
  guard: string;
  humanDecision: string;
  releasedEffect: string;
  recoveryReason: string;
}

export default function HumanGateCircuit({
  title,
  candidate,
  guard,
  humanDecision,
  releasedEffect,
  recoveryReason,
}: HumanGateCircuitProps) {
  return (
    <figure className="human-gate-circuit">
      <figcaption>
        <p className="human-gate-circuit__kicker">Fail-closed circuit</p>
        <h2>{title}</h2>
        <p>A valid route names its actor, guard, human gate, effect, and recovery path.</p>
      </figcaption>

      <div className="human-gate-circuit__board" aria-hidden="true">
        <div className="human-gate-circuit__node" data-state="candidate">
          <span>candidate</span>
          <strong>{candidate}</strong>
        </div>
        <div className="human-gate-circuit__wire">
          <span>system guard</span>
          <strong>{guard}</strong>
        </div>
        <div className="human-gate-circuit__node" data-state="gate">
          <span>human gate</span>
          <strong>{humanDecision}</strong>
        </div>
        <div className="human-gate-circuit__wire">
          <span>separate release</span>
          <strong>permission checked</strong>
        </div>
        <div className="human-gate-circuit__node" data-state="effect">
          <span>bounded effect</span>
          <strong>{releasedEffect}</strong>
        </div>
        <div className="human-gate-circuit__branch">
          <span>guard fails or release is withheld</span>
          <i aria-hidden="true">↓</i>
        </div>
        <div className="human-gate-circuit__recovery">
          <span>fail-closed recovery</span>
          <strong>{recoveryReason}</strong>
        </div>
      </div>

      <ol className="human-gate-circuit__fallback">
        <li>The candidate is prepared but carries no effect authority.</li>
        <li>The system checks the declared guard: {guard}.</li>
        <li>A person chooses {humanDecision}; validation alone cannot choose.</li>
        <li>Only a separate permission may release {releasedEffect}.</li>
        <li>
          If the guard fails or the person withholds release, the route enters fail-closed
          recovery: {recoveryReason}.
        </li>
      </ol>
    </figure>
  );
}
