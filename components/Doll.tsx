
import React from 'react';
import { LightStatus } from '../types';

interface FlagBearerProps {
  lightStatus: LightStatus;
  isTurning: boolean;
  turnSpeed: number;
}

const FlagSVG: React.FC<{ color: string }> = ({ color }) => (
  <svg width="60" height="60" viewBox="0 0 100 100" className="absolute -top-10 -left-2">
    <line x1="5" y1="95" x2="5" y2="5" stroke="#a16207" strokeWidth="6" strokeLinecap="round" />
    <rect x="5" y="5" width="70" height="40" fill={color} stroke={color} strokeWidth="2" />
  </svg>
);


export const FlagBearer: React.FC<FlagBearerProps> = ({ lightStatus, isTurning, turnSpeed }) => {
  const isRed = lightStatus === LightStatus.Red;

  return (
    <div className="absolute right-8 bottom-12 flex flex-col items-center" style={{ perspective: '1000px' }}>
        <div 
            className="transition-transform ease-in-out relative"
            style={{ 
                transform: isRed && !isTurning ? 'rotateY(0deg)' : 'rotateY(180deg)',
                transitionDuration: `${turnSpeed}ms`,
                transformStyle: 'preserve-3d' 
            }}
        >
            {/* Facing Player (Red Light) */}
            <div className="w-16 h-32" style={{ backfaceVisibility: 'hidden' }}>
                 <svg width="64" height="128" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="25" r="15" fill="#f87171"/>
                    <rect x="40" y="40" width="20" height="60" rx="10" fill="#f87171" />
                    <rect x="25" y="95" width="20" height="50" rx="10" fill="#f87171" transform="rotate(-15 25 95)" />
                    <rect x="55" y="95" width="20" height="50" rx="10" fill="#f87171" transform="rotate(15 55 95)" />
                    <g transform="translate(30, 45) rotate(-30)">
                        <rect x="0" y="0" width="15" height="40" rx="7.5" fill="#f87171" />
                    </g>
                 </svg>
                 <FlagSVG color="#ef4444" />
            </div>
            {/* Facing Away (Green Light) */}
            <div className="absolute top-0 left-0 w-16 h-32" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <svg width="64" height="128" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="25" r="15" fill="#4ade80"/>
                    <rect x="40" y="40" width="20" height="60" rx="10" fill="#4ade80" />
                    <rect x="25" y="95" width="20" height="50" rx="10" fill="#4ade80" transform="rotate(-15 25 95)" />
                    <rect x="55" y="95" width="20" height="50" rx="10" fill="#4ade80" transform="rotate(15 55 95)" />
                    <g transform="translate(30, 45) rotate(0)">
                         <rect x="0" y="0" width="15" height="40" rx="7.5" fill="#4ade80" />
                    </g>
                 </svg>
                 <FlagSVG color="#22c55e" />
            </div>
        </div>
    </div>
  );
};
