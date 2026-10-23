import { useState, type CSSProperties } from 'react';
import { imageManifest, type ImageName } from '../data/images.gen';

interface PictureProps {
  name: ImageName;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  priority?: boolean;
  /** Mostra o placeholder desfocado até a imagem carregar */
  placeholder?: boolean;
}

export function srcSet(name: ImageName, ext: 'avif' | 'webp') {
  const m = imageManifest[name];
  return m.widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(', ');
}

export function largestSrc(name: ImageName, ext: 'avif' | 'webp' = 'webp') {
  const m = imageManifest[name];
  return `/img/${name}-${m.widths[m.widths.length - 1]}.${ext}`;
}

/** Imagem responsiva (AVIF/WebP) com placeholder LQIP e dimensões intrínsecas (sem CLS). */
export function Picture({
  name,
  alt,
  sizes = '100vw',
  className = '',
  imgClassName = '',
  style,
  imgStyle,
  priority = false,
  placeholder = true,
}: PictureProps) {
  const m = imageManifest[name];
  const [loaded, setLoaded] = useState(false);
  return (
    <picture
      className={className}
      style={{
        ...(placeholder && !loaded ? { backgroundImage: `url(${m.lqip})`, backgroundSize: 'cover', backgroundPosition: 'center' } : null),
        ...style,
      }}
    >
      <source type="image/avif" srcSet={srcSet(name, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, 'webp')} sizes={sizes} />
      <img
        src={largestSrc(name)}
        alt={alt}
        width={m.width}
        height={m.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
        }}
        className={`${imgClassName} transition-opacity duration-700 ${placeholder && !loaded ? 'opacity-0' : 'opacity-100'}`}
        style={imgStyle}
      />
    </picture>
  );
}
