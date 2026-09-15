export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-lockup">
      <img
        className="brand-mark"
        width="34"
        height="34"
        src="/brand/gunbeon-symbol.svg"
        alt={compact ? '군번여지도' : ''}
      />
      {!compact && (
        <span>
          군번여지도<small>강원</small>
        </span>
      )}
    </span>
  );
}
