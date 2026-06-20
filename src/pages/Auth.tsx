import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Mail, Lock, Eye, EyeOff, CheckSquare } from 'lucide-react';

/**
 * 登录/注册页面
 * 支持邮箱+密码的登录和注册，可切换表单模式
 */
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('请填写邮箱和密码');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (result.error) {
        setError(result.error);
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setError('操作失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 切换登录/注册模式
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* 品牌 Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <CheckSquare className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">滴答清单</span>
      </div>

      {/* 登录/注册卡片 */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
          {isLogin ? '登录账号' : '创建账号'}
        </h2>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 邮箱输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              邮箱
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* 密码输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少6个字符）"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? '处理中...'
              : isLogin
                ? '登录'
                : '注册'
            }
          </button>
        </form>

        {/* 切换登录/注册 */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button
            onClick={toggleMode}
            className="ml-1 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
          >
            {isLogin ? '立即注册' : '返回登录'}
          </button>
        </p>
      </div>

      {/* 底部版权 */}
      <p className="mt-8 text-xs text-gray-400">
        滴答清单 - 高效管理你的每一天
      </p>
    </div>
  );
}
