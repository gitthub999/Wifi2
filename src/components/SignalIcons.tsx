import React from 'react';
import { SignalQuality, SignalSample } from '../types/wifi';

interface WifiBarsIconProps {
  bars: 1 | 2 | 3 | 4;
  locked?: boolean;
  active?: boolean;
  size?: number;
}

export const WifiBarsIcon: React.FC<WifiBarsIconProps> = ({
  bars,
  locked = false,
  active = false,
  size = 24,
}) => {
  const activeColor = active ? '#2563EB' : '#0F172A';
  const inactiveColor = '#CBD5E1';

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        {/* Outer arc (4 bars) */}
        <path
          d="M2.5 8.5C7.8 3.8 16.2 3.8 21.5 8.5"
          stroke={bars >= 4 ? activeColor : inactiveColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Middle-outer arc (3 bars) */}
        <path
          d="M5.5 11.8C9.2 8.5 14.8 8.5 18.5 11.8"
          stroke={bars >= 3 ? activeColor : inactiveColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Inner arc (2 bars) */}
        <path
          d="M8.6 15.1C10.5 13.4 13.5 13.4 15.4 15.1"
          stroke={bars >= 2 ? activeColor : inactiveColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Base dot (1 bar) */}
        <circle
          cx="12"
          cy="18.5"
          r="1.7"
          fill={bars >= 1 ? activeColor : inactiveColor}
        />
      </svg>
      {locked && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200"
          aria-hidden="true"
        >
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
            <rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
            <path d="M4 5.5V4a2 2 0 114 0v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
      )}
    </div>
  );
};

interface SignalSparklineProps {
  samples: SignalSample[];
  quality: SignalQuality;
}

export const SignalSparkline: React.FC<SignalSparklineProps> = ({ samples, quality }) => {
  const width = 420;
  const height = 108;
  const padLeft = 36;
  const padRight = 8;
  const padTop = 10;
  const padBottom = 18;

  const strokeColor =
    quality === 'excellent'
      ? '#16A34A'
      : quality === 'good'
      ? '#2563EB'
      : quality === 'fair'
      ? '#D97706'
      : '#DC2626';

  const fillColor =
    quality === 'excellent'
      ? 'rgba(22, 163, 74, 0.12)'
      : quality === 'good'
      ? 'rgba(37, 99, 235, 0.12)'
      : quality === 'fair'
      ? 'rgba(217, 119, 6, 0.12)'
      : 'rgba(220, 38, 38, 0.12)';

  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;

  const minRssi = -95;
  const maxRssi = -35;

  const toY = (rssi: number) => {
    const clamped = Math.max(minRssi, Math.min(maxRssi, rssi));
    const ratio = (clamped - minRssi) / (maxRssi - minRssi);
    return padTop + innerHeight - ratio * innerHeight;
  };

  const points = samples.map((sample, idx) => {
    const x =
      samples.length <= 1
        ? padLeft + innerWidth
        : padLeft + (idx / (samples.length - 1)) * innerWidth;
    const y = toY(sample.rssiDbm);
    return { x, y, sample };
  });

  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath =
    points.length > 1
      ? `M ${points[0].x.toFixed(1)} ${(padTop + innerHeight).toFixed(1)} ` +
        points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${points[points.length - 1].x.toFixed(1)} ${(padTop + innerHeight).toFixed(1)} Z`
      : '';

  const gridLines = [-40, -60, -80];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-28 select-none"
      role="img"
      aria-label="Live Wi-Fi signal strength history chart"
    >
      {gridLines.map((dbm) => {
        const y = toY(dbm);
        return (
          <g key={dbm}>
            <line
              x1={padLeft}
              y1={y}
              x2={width - padRight}
              y2={y}
              stroke="#E2E8F0"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <text
              x={padLeft - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-slate-400 text-[9px] font-mono"
            >
              {dbm}
            </text>
          </g>
        );
      })}

      {areaPath && <path d={areaPath} fill={fillColor} />}

      {points.length > 1 && (
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polyline}
        />
      )}

      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3.5"
          fill={strokeColor}
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
      )}

      <text
        x={padLeft}
        y={height - 3}
        className="fill-slate-400 text-[9px] font-mono"
      >
        -30s
      </text>
      <text
        x={width - padRight}
        y={height - 3}
        textAnchor="end"
        className="fill-slate-400 text-[9px] font-mono"
      >
        Now
      </text>
    </svg>
  );
};
