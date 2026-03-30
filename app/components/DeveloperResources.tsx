'use client';

import { useMemo } from 'react';

const PREVIEW_WIDTH = 250;
const PREVIEW_HEIGHT = 120;
const PREVIEW_FALLBACK_TEXT = 'Preview unavailable';

const escapeSvgText = (value: string) =>
    value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');

const buildFallbackPreview = (title: string) => {
    const safeTitle = escapeSvgText(title);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PREVIEW_WIDTH}" height="${PREVIEW_HEIGHT}" viewBox="0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}" role="img" aria-label="${safeTitle}">
  <rect width="100%" height="100%" rx="10" ry="10" fill="#1f2b28"/>
  <rect x="8" y="8" width="${PREVIEW_WIDTH - 16}" height="${PREVIEW_HEIGHT - 16}" rx="8" ry="8" fill="#263733" stroke="#2f453f"/>
  <text x="50%" y="52%" fill="#e5f7f0" font-size="13" font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle" dominant-baseline="middle" textLength="${PREVIEW_WIDTH - 32}" lengthAdjust="spacingAndGlyphs">${safeTitle}</text>
  <text x="50%" y="70%" fill="#9bb9ad" font-size="11" font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle" dominant-baseline="middle">${PREVIEW_FALLBACK_TEXT}</text>
</svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export function DeveloperResources() {
    return (
        <div className="card">
            <div className="card-body">
                <div className="card-title d-flex justify-content-between border-bottom border-gray-300 pb-2">
                    <div className="me-4">Kickstart your development journey on Solana</div>
                    <div>
                        Find more on{' '}
                        <a href="https://solana.com/developers" target="_blank" rel="noreferrer">
                            solana.com/developers
                        </a>
                    </div>
                </div>
                <div className="d-flex gap-4 pb-3 overflow-auto">
                    <ResourceCard
                        title="Setup Your Solana Environment"
                        description="Get started in 5 minutes or less!"
                        image="https://solana.com/opengraph/developers/docs/intro/installation"
                        link="https://solana.com/docs/intro/installation"
                    />
                    <ResourceCard
                        title="Quick Start Guide"
                        description="Hands-on guide to the core concepts for building on Solana"
                        image="https://solana.com/_next/image?url=%2Fassets%2Fdocs%2Fintro%2Fquickstart%2Fpg-not-connected.png&w=1920&q=75"
                        link="https://solana.com/docs/intro/quick-start"
                    />
                    <ResourceCard
                        title="Solana Developer Bootcamp"
                        description="11 hours of video lessons on Solana Development"
                        image="https://i.ytimg.com/vi/amAq-WHAFs8/maxresdefault.jpg"
                        link="https://www.youtube.com/watch?v=amAq-WHAFs8"
                    />
                    <ResourceCard
                        title="60 Days of Solana"
                        description="A course designed for EVM developers to learn Solana"
                        image="https://www.rareskills.io/wp-content/uploads/2024/08/og-image-rareskills.png"
                        imageBackground="white"
                        link="https://www.rareskills.io/solana-tutorial"
                    />
                </div>
            </div>
        </div>
    );
}

function ResourceCard({
    title,
    description,
    image,
    link,
    imageBackground,
}: {
    title: string;
    description: string;
    image: string;
    imageBackground?: string;
    link: string;
}) {
    const fallbackPreview = useMemo(() => buildFallbackPreview(title), [title]);

    return (
        <div className="flex flex-col" style={{ height: '200px', width: '250px' }}>
            <div className="w-full mb-3">
                <a href={link} target="_blank" rel="noopener noreferrer" className="hover:cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image}
                        alt={`${title} preview`}
                        onError={event => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = fallbackPreview;
                        }}
                        style={{
                            backgroundColor: imageBackground,
                            height: `${PREVIEW_HEIGHT}px`,
                            objectFit: 'cover',
                            width: `${PREVIEW_WIDTH}px`,
                        }}
                    />
                </a>
            </div>
            <div className="flex flex-col">
                <p className="mb-1">{title}</p>
                <p className="text-muted mb-2 text-wrap line-clamp-3">{description}</p>
            </div>
        </div>
    );
}
