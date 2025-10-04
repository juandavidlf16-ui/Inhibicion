
import React, { useEffect } from 'react';

interface CharacterProps {
  isMoving: boolean;
}

const useCharacterStyles = () => {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('character-animations')) return;

    const style = document.createElement('style');
    style.id = 'character-animations';
    style.innerHTML = `
      .runner-3d {
        width: 96px;
        height: 120px;
        position: relative;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        perspective: 600px;
        transform-style: preserve-3d;
      }

      .runner-3d__shadow {
        position: absolute;
        bottom: 8px;
        left: 50%;
        width: 72px;
        height: 22px;
        background: radial-gradient(ellipse at center, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0) 70%);
        transform: translateX(-50%) scaleX(0.92);
        filter: blur(1px);
        opacity: 0.65;
        animation: runner-shadow 0.55s ease-in-out infinite;
        animation-play-state: paused;
      }

      .runner-3d__body {
        position: relative;
        width: 46px;
        height: 100px;
        transform-style: preserve-3d;
        transform: translate3d(0, -6px, 0);
        animation: runner-idle-body 2.4s ease-in-out infinite;
      }

      .runner-3d__head {
        position: absolute;
        top: 0;
        left: 50%;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        transform: translate3d(-50%, -18px, 12px);
        background: radial-gradient(circle at 30% 35%, #f8fafc 0%, #38bdf8 55%, #0ea5e9 80%, #0369a1 100%);
        box-shadow: 0 8px 16px rgba(15, 23, 42, 0.35);
      }

      .runner-3d__face {
        position: absolute;
        top: 32%;
        left: 50%;
        width: 70%;
        height: 55%;
        transform: translate3d(-50%, 0, 10px);
        border-radius: 45% 45% 55% 55%;
        background: radial-gradient(circle at 50% 35%, #fef9c3 0%, #facc15 60%, #f59e0b 100%);
        box-shadow: 0 0 6px rgba(250, 204, 21, 0.4);
      }

      .runner-3d__face::before {
        content: '';
        position: absolute;
        top: 38%;
        left: 50%;
        width: 44%;
        height: 28%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: rgba(15, 23, 42, 0.25);
        filter: blur(2px);
        opacity: 0.5;
      }

      .runner-3d__torso {
        position: absolute;
        top: 38px;
        left: 50%;
        width: 46px;
        height: 54px;
        transform: translate3d(-50%, 0, 0);
        background: linear-gradient(140deg, #0ea5e9 0%, #0284c7 45%, #0369a1 100%);
        border-radius: 48% 48% 32% 32% / 55% 55% 40% 40%;
        box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.25), 0 12px 18px rgba(14, 165, 233, 0.24);
      }

      .runner-3d__torso::after {
        content: '';
        position: absolute;
        inset: 6px 12px;
        border-radius: 18px;
        background: linear-gradient(160deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
        transform: translateZ(10px);
      }

      .runner-3d__torso-core {
        position: absolute;
        inset: 14px 14px 10px;
        border-radius: 16px;
        background: linear-gradient(160deg, #14b8a6 0%, #0f766e 80%);
        transform: translateZ(12px);
        box-shadow: 0 0 14px rgba(20, 184, 166, 0.45);
      }

      .runner-3d__arm {
        position: absolute;
        top: 44px;
        width: 12px;
        height: 50px;
        border-radius: 999px;
        background: linear-gradient(135deg, #bae6fd 0%, #0ea5e9 80%);
        box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.2);
        transform-origin: top center;
        transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
        transition: transform 0.35s ease;
        animation-play-state: paused;
      }

      .runner-3d__arm::after {
        content: '';
        position: absolute;
        inset: 4px 3px;
        border-radius: inherit;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0));
      }

      .runner-3d__arm--left {
        left: -18px;
        animation: runner-arm-left 0.55s ease-in-out infinite;
      }

      .runner-3d__arm--right {
        right: -18px;
        animation: runner-arm-right 0.55s ease-in-out infinite;
      }

      .runner-3d__leg {
        position: absolute;
        bottom: 0;
        width: 16px;
        height: 56px;
        border-radius: 999px;
        background: linear-gradient(160deg, #1d4ed8 0%, #1e3a8a 100%);
        box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.25);
        transform-origin: top center;
        transform: rotateX(0deg) rotateZ(0deg);
        transition: transform 0.35s ease;
        animation-play-state: paused;
      }

      .runner-3d__leg::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        width: 32px;
        height: 14px;
        transform: translateX(-50%) rotateX(78deg);
        transform-origin: center;
        border-radius: 999px;
        background: linear-gradient(90deg, #e2e8f0 0%, #94a3b8 60%, #cbd5f5 100%);
        box-shadow: 0 6px 10px rgba(15, 23, 42, 0.35);
      }

      .runner-3d__leg--left {
        left: 4px;
        animation: runner-leg-left 0.55s ease-in-out infinite;
      }

      .runner-3d__leg--right {
        right: 4px;
        animation: runner-leg-right 0.55s ease-in-out infinite;
      }

      .runner-3d--running .runner-3d__arm,
      .runner-3d--running .runner-3d__leg,
      .runner-3d--running .runner-3d__shadow {
        animation-play-state: running;
      }

      .runner-3d--idle .runner-3d__arm--left {
        transform: rotateX(-8deg) rotateY(18deg) rotateZ(12deg);
      }

      .runner-3d--idle .runner-3d__arm--right {
        transform: rotateX(-6deg) rotateY(-16deg) rotateZ(-10deg);
      }

      .runner-3d--idle .runner-3d__leg--left {
        transform: rotateX(6deg) rotateZ(4deg);
      }

      .runner-3d--idle .runner-3d__leg--right {
        transform: rotateX(-4deg) rotateZ(-2deg);
      }

      .runner-3d--running .runner-3d__torso {
        box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2), 0 18px 24px rgba(14, 165, 233, 0.32);
      }

      @keyframes runner-arm-left {
        0%, 100% {
          transform: rotateX(32deg) rotateY(16deg) rotateZ(26deg);
        }
        50% {
          transform: rotateX(-34deg) rotateY(10deg) rotateZ(-16deg);
        }
      }

      @keyframes runner-arm-right {
        0%, 100% {
          transform: rotateX(-32deg) rotateY(-18deg) rotateZ(-24deg);
        }
        50% {
          transform: rotateX(34deg) rotateY(-12deg) rotateZ(18deg);
        }
      }

      @keyframes runner-leg-left {
        0%, 100% {
          transform: rotateX(10deg) rotateZ(2deg);
        }
        50% {
          transform: rotateX(-34deg) rotateZ(-6deg);
        }
      }

      @keyframes runner-leg-right {
        0%, 100% {
          transform: rotateX(-30deg) rotateZ(-4deg);
        }
        50% {
          transform: rotateX(28deg) rotateZ(6deg);
        }
      }

      @keyframes runner-stride-body {
        0%, 100% {
          transform: translate3d(0, -6px, 6px) rotateX(-6deg);
        }
        50% {
          transform: translate3d(0, -22px, 10px) rotateX(4deg);
        }
      }

      @keyframes runner-idle-body {
        0%, 100% {
          transform: translate3d(0, -6px, 6px) rotateX(-4deg);
        }
        50% {
          transform: translate3d(0, -10px, 4px) rotateX(-1deg);
        }
      }

      @keyframes runner-shadow {
        0%, 100% {
          transform: translateX(-50%) scale(1, 0.78);
          opacity: 0.6;
        }
        50% {
          transform: translateX(-50%) scale(0.78, 0.58);
          opacity: 0.4;
        }
      }

      @keyframes wave {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(25deg); }
      }

      .animate-wave {
        animation: wave 1s ease-in-out infinite;
        transform-origin: 35px 35px;
      }
    `;

    document.head.appendChild(style);
  }, []);
};

const RunnerModel: React.FC<{ isMoving: boolean }> = ({ isMoving }) => (
  <div
    className={`runner-3d ${isMoving ? 'runner-3d--running' : 'runner-3d--idle'}`}
    role="img"
    aria-label={isMoving ? 'Personaje corriendo' : 'Personaje detenido'}
  >
    <div className="runner-3d__shadow" />
    <div className="runner-3d__body">
      <div className="runner-3d__head">
        <div className="runner-3d__face" />
      </div>
      <div className="runner-3d__torso">
        <div className="runner-3d__torso-core" />
      </div>
      <div className="runner-3d__arm runner-3d__arm--left" />
      <div className="runner-3d__arm runner-3d__arm--right" />
      <div className="runner-3d__leg runner-3d__leg--left" />
      <div className="runner-3d__leg runner-3d__leg--right" />
    </div>
  </div>
);

const WaverSVG: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="20" r="10" stroke="#facc15" strokeWidth="6"/>
    <line x1="50" y1="30" x2="50" y2="60" stroke="#facc15" strokeWidth="6"/>
    <line x1="50" y1="40" x2="30" y2="25" stroke="#facc15" strokeWidth="6" className={'animate-wave'}/>
    <line x1="50" y1="40" x2="70" y2="55" stroke="#facc15" strokeWidth="6"/>
    <line x1="50" y1="60" x2={'65'} y2={'85'} stroke="#facc15" strokeWidth="6"/>
    <line x1="50" y1="60" x2={'35'} y2={'85'} stroke="#facc15" strokeWidth="6"/>
  </svg>
);

export const RunnerCharacter: React.FC<CharacterProps> = ({ isMoving }) => {
  useCharacterStyles();
  return <RunnerModel isMoving={isMoving} />;
};

export const WaverCharacter: React.FC<CharacterProps> = ({ isMoving }) => {
  useCharacterStyles();

  return <WaverSVG />;
};
