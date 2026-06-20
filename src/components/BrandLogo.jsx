import React from 'react';

export const LOGO_SRC = `${process.env.PUBLIC_URL}/nickyLogov2png.png`;

const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 52,
};

function BrandLogo({
  size = 'md',
  showName = true,
  name = 'NickyAnime',
  className = '',
  onClick,
  iconOnly = false,
}) {
  const dimension = SIZE_MAP[size] || SIZE_MAP.md;
  const showLabel = showName && !iconOnly;
  const isInteractive = typeof onClick === 'function';

  const content = (
    <>
      <img
        src={LOGO_SRC}
        alt="Nicky Anime"
        className="brand-logo__image"
        width={dimension}
        height={dimension}
        loading="eager"
      />
      {showLabel && <span className="brand-logo__name">{name}</span>}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        className={`brand-logo brand-logo--${size} ${className}`.trim()}
        onClick={onClick}
        aria-label={showLabel ? name : 'Nicky Anime'}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`brand-logo brand-logo--${size} ${className}`.trim()} aria-label={showLabel ? name : 'Nicky Anime'}>
      {content}
    </div>
  );
}

export default BrandLogo;
