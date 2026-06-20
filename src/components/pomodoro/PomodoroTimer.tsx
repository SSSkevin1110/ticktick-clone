import { useEffect, useRef } from 'react';
import { Play, Pause, Square, SkipForward } from 'lucide-react';
import { usePomodoroStore } from '../../stores/pomodoroStore';

/**
 * 使用 Web Audio API 生成提示音
 * 不需要音频文件，程序化生成简单的蜂鸣声
 */
function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // 两段提示音：先高后低
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(660, audioCtx.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.4);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.8);
  } catch (err) {
    console.warn('[Pomodoro] 无法播放提示音:', err);
  }
}

/**
 * 格式化秒数为 MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 番茄钟计时器组件
 * - 大圆形进度条（环形 SVG）
 * - 中间显示剩余时间
 * - 下方显示当前状态
 * - 控制按钮
 */
export default function PomodoroTimer() {
  const {
    isRunning,
    isBreak,
    timeLeft,
    settings,
    completedSessions,
    startPomodoro,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    skipBreak,
    tick,
  } = usePomodoroStore();

  const intervalRef = useRef<number | null>(null);
  const prevRunningRef = useRef(isRunning);

  // 计时器逻辑：每秒调用 tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, tick]);

  // 监听状态变化，播放提示音（从运行到休息或从休息到停止）
  useEffect(() => {
    if (prevRunningRef.current && !isRunning && isBreak) {
      // 工作结束，进入休息
      playNotificationSound();
    }
    if (prevRunningRef.current && !isRunning && !isBreak && timeLeft === settings.workDuration) {
      // 休息结束（或刚停止）
      if (completedSessions > 0) {
        playNotificationSound();
      }
    }
    prevRunningRef.current = isRunning;
  }, [isRunning, isBreak, timeLeft, settings.workDuration, completedSessions]);

  // 计算进度百分比
  const totalTime = isBreak
    ? completedSessions % settings.sessionsBeforeLongBreak === 0 && completedSessions > 0
      ? settings.longBreak
      : settings.shortBreak
    : settings.workDuration;

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // SVG 圆形进度条参数
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // 状态颜色
  const colorClass = isBreak ? 'text-green-500' : 'text-indigo-500';
  const bgColorClass = isBreak ? 'text-green-500' : 'text-indigo-500';

  // 状态文本
  const statusText = isBreak ? '休息中' : isRunning ? '专注中' : '准备开始';

  return (
    <div className="flex flex-col items-center">
      {/* 圆形进度条 */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* 背景圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          {/* 进度圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-300`}
          />
        </svg>

        {/* 中间时间显示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold ${colorClass}`}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-gray-500 mt-1">{statusText}</span>
        </div>
      </div>

      {/* 今日番茄数 */}
      <div className="mt-4 text-sm text-gray-500">
        <span className={`font-semibold ${bgColorClass}`}>{completedSessions}</span> / {settings.sessionsBeforeLongBreak} 个番茄
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-3 mt-6">
        {!isRunning && !isBreak && completedSessions === 0 && (
          /* 初始状态：开始按钮 */
          <button
            onClick={() => startPomodoro()}
            className={`flex items-center justify-center w-14 h-14 rounded-full ${colorClass} bg-current text-white hover:opacity-90 transition-opacity`}
          >
            <Play size={24} className="ml-1" />
          </button>
        )}

        {isRunning && (
          /* 运行中：暂停 + 停止 */
          <>
            <button
              onClick={pausePomodoro}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
            >
              <Pause size={24} />
            </button>
            <button
              onClick={stopPomodoro}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
            >
              <Square size={18} />
            </button>
          </>
        )}

        {!isRunning && isBreak && (
          /* 休息中暂停：跳过 + 停止 */
          <>
            <button
              onClick={skipBreak}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              <SkipForward size={24} />
            </button>
            <button
              onClick={stopPomodoro}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
            >
              <Square size={18} />
            </button>
          </>
        )}

        {!isRunning && !isBreak && (completedSessions > 0 || timeLeft < settings.workDuration) && (
          /* 暂停后恢复 */
          <>
            <button
              onClick={resumePomodoro}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
            >
              <Play size={24} className="ml-1" />
            </button>
            <button
              onClick={stopPomodoro}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
            >
              <Square size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
