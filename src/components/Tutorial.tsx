import { useState } from 'react';
import { X, CheckSquare, Calendar, Timer, Target, ArrowRight, Sparkles } from 'lucide-react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 新手引导教程
 * 首次打开应用时显示，介绍核心功能
 */
export default function Tutorial({ isOpen, onClose }: TutorialProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <CheckSquare size={48} className="text-indigo-500" />,
      title: '欢迎使用 TickFlow',
      description: '一款高效的任务管理工具，帮助你更好地规划和管理每一天。',
      tips: ['简洁的界面设计', '强大的任务管理', '多设备同步'],
    },
    {
      icon: <Sparkles size={48} className="text-indigo-500" />,
      title: '快速添加任务',
      description: '点击「+ 添加任务」或按 N 键，输入任务名称即可快速创建。支持自然语言输入！',
      tips: ['输入「明天开会 #工作 !高」自动解析', '支持日期、优先级、标签', '回车即可提交'],
    },
    {
      icon: <Calendar size={48} className="text-indigo-500" />,
      title: '多视图日历',
      description: '在日历页面，你可以切换月视图、周视图、日视图和议程视图，直观管理你的时间。',
      tips: ['月视图查看整月安排', '周视图查看一周计划', '日视图管理具体时间段'],
    },
    {
      icon: <Timer size={48} className="text-indigo-500" />,
      title: '番茄钟专注',
      description: '使用番茄钟功能，25分钟专注工作，5分钟休息，提升你的工作效率。',
      tips: ['可关联具体任务', '支持自定义时长', '专注统计追踪'],
    },
    {
      icon: <Target size={48} className="text-indigo-500" />,
      title: '开始使用吧！',
      description: '现在就开始创建你的第一个任务，开启高效的一天！',
      tips: ['点击「+ 添加任务」开始', '按 ? 查看所有快捷键', '在设置中自定义主题'],
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 教程卡片 */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_300ms_ease]">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* 顶部装饰 */}
        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          {currentStep.icon}
        </div>

        {/* 内容 */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {currentStep.title}
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            {currentStep.description}
          </p>

          {/* 提示列表 */}
          <div className="space-y-3 mb-6">
            {currentStep.tips.map((tip, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700">{tip}</span>
              </div>
            ))}
          </div>

          {/* 进度指示器 */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === step
                    ? 'w-6 bg-indigo-500'
                    : index < step
                    ? 'w-2 bg-indigo-300'
                    : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* 按钮 */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                上一步
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                下一步
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
              >
                开始使用
              </button>
            )}
          </div>

          {/* 跳过 */}
          {step < steps.length - 1 && (
            <button
              onClick={onClose}
              className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              跳过教程
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
