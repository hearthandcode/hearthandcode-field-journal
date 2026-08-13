import '../styles/return-trail.css';

export interface ReturnTrailStop {
  label: string;
  kind: string;
  relation: string;
  limit: string;
}

interface ReturnTrailProps {
  title: string;
  introduction: string;
  stops: ReturnTrailStop[];
  returnLabel: string;
}

export default function ReturnTrail({
  title,
  introduction,
  stops,
  returnLabel,
}: ReturnTrailProps) {
  return (
    <figure className="return-trail">
      <figcaption>
        <p className="return-trail__kicker">Return trail</p>
        <h2>{title}</h2>
        <p>{introduction}</p>
      </figcaption>

      <div className="return-trail__map">
        <ol className="return-trail__stops">
          {stops.map((stop, index) => (
            <li className="return-trail__stop" key={`${stop.kind}-${stop.label}`}>
              <span className="return-trail__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="return-trail__kind">{stop.kind}</p>
              <h3>{stop.label}</h3>
              {index < stops.length - 1 ? (
                <p className="return-trail__relation">
                  <span aria-hidden="true">→</span> {stop.relation}
                </p>
              ) : null}
              <p className="return-trail__limit">Limit: {stop.limit}</p>
            </li>
          ))}
        </ol>

        <div className="return-trail__return" aria-hidden="true">
          <span>↩</span>
          <i />
        </div>
      </div>

      <p className="return-trail__fallback">
        <strong>Return condition:</strong> {returnLabel}. The return carries evidence or correction
        back toward the source; it does not silently rewrite any prior state.
      </p>
    </figure>
  );
}
