import '../styles/boundary-forge.css';

export interface BoundaryPlate {
  left: string;
  right: string;
  meaning: string;
  risk: string;
}

interface BoundaryForgeProps {
  title: string;
  introduction: string;
  plates: BoundaryPlate[];
}

export default function BoundaryForge({
  title,
  introduction,
  plates,
}: BoundaryForgeProps) {
  return (
    <figure className="boundary-forge">
      <figcaption>
        <p className="boundary-forge__kicker">Five type boundaries</p>
        <h2>{title}</h2>
        <p>{introduction}</p>
      </figcaption>

      <ol className="boundary-forge__plates">
        {plates.map((plate, index) => (
          <li className="boundary-forge__plate" key={`${plate.left}-${plate.right}`}>
            <span className="boundary-forge__number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className="boundary-forge__equation">
              <code>{plate.left}</code>
              <strong>
                <span className="sr-only">is not equal to</span>
                <span aria-hidden="true">≠</span>
              </strong>
              <code>{plate.right}</code>
            </p>
            <p>{plate.meaning}</p>
            <p className="boundary-forge__risk"><strong>If blurred:</strong> {plate.risk}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}
