import { useState } from 'react';
import { ArrowLeft, Bell, Clock, CalendarDays, Info, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import ColorPicker from '../components/ColorPicker';
import { useThemeStore } from '../stores/themeStore';

/**
 * 设置页面
 * 包含主题设置、主色调设置、通知设置、时间格式、一周起始日、关于信息
 */
export default function Settings() {
  const navigate = useNavigate();
  const { resolvedTheme } = useThemeStore();

  // 通知设置
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('ticktick-notifications') !== 'false';
  });

  // 时间格式
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(() => {
    return (localStorage.getItem('ticktick-time-format') as '12h' | '24h') || '24h';
  });

  // 一周起始日
  const [weekStart, setWeekStart] = useState<'sunday' | 'monday'>(() => {
    return (localStorage.getItem('ticktick-week-start') as 'sunday' | 'monday') || 'sunday';
  });

  // 切换通知设置
  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('ticktick-notifications', String(newValue));
  };

  // 切换时间格式
  const toggleTimeFormat = (format: '12h' | '24h') => {
    setTimeFormat(format);
    localStorage.setItem('ticktick-time-format', format);
  };

  // 切换一周起始日
  const toggleWeekStart = (start: 'sunday' | 'monday') => {
    setWeekStart(start);
    localStorage.setItem('ticktick-week-start', start);
  };

  // 判断是否为暗色模式
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* 顶部导航 */}
      <div className={`sticky top-0 z-10 backdrop-blur-sm border-b ${
        isDark
          ? 'bg-gray-900/80 border-gray-700'
          : 'bg-gray-50/80 border-gray-200'
      }`}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-gray-400 hover:bg-gray-800'
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            设置
          </h1>
        </div>
      </div>

      {/* 设置内容 */}
      <div className="w-full px-6 py-6 space-y-6">
        {/* 主题设置 */}
        <section className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Palette size={18} className="text-indigo-500" />
            <h2 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>主题</h2>
          </div>
          <ThemeToggle />
        </section>

        {/* 主色调设置 */}
        <section className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Palette size={18} className="text-indigo-500" />
            <h2 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>主色调</h2>
          </div>
          <ColorPicker />
        </section>

        {/* 通知设置 */}
        <section className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-indigo-500" />
              <div>
                <h2 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>通知</h2>
                <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  开启后将收到任务提醒通知
                </p>
              </div>
            </div>
            <button
              onClick={toggleNotifications}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notificationsEnabled ? 'bg-indigo-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </section>

        {/* 时间格式设置 */}
        <section className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-indigo-500" />
            <h2 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>时间格式</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleTimeFormat('12h')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                timeFormat === '12h'
                  ? 'bg-indigo-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              12小时制
            </button>
            <button
              onClick={() => toggleTimeFormat('24h')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                timeFormat === '24h'
                  ? 'bg-indigo-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              24小时制
            </button>
          </div>
        </section>

        {/* 一周起始日设置 */}
        <section className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-indigo-500" />
            <h2 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>一周起始日</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleWeekStart('sunday')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                weekStart === 'sunday'
                  ? 'bg-indigo-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              周日
            </button>
            <button
              onClick={() => toggleWeekStart('monday')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                weekStart === 'monday'
                  ? 'bg-indigo-500 text-white'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              周一
            </button>
          </div>
        </section>

        {/* 关于信息 */}
        <section className={`rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} className="text-indigo-500" />
            <h2 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>关于</h2>
          </div>
          <div className={`space-y-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex justify-between">
              <span>应用名称</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>滴答清单</span>
            </div>
            <div className="flex justify-between">
              <span>版本</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>技术栈</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>React + TypeScript + Tailwind CSS</span>
            </div>
          </div>
        </section>

        {/* 底部间距 */}
        <div className="h-8" />
      </div>
    </div>
  );
}
