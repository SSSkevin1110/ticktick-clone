-- ============================================
-- 滴答清单复刻 - Supabase数据库Schema
-- 在Supabase Dashboard -> SQL Editor中运行此脚本
-- ============================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 用户资料表 (扩展auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Shanghai',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 新用户注册时自动创建profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. 清单表
-- ============================================
CREATE TABLE IF NOT EXISTS lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366F1',
  icon TEXT DEFAULT '📁',
  sort_order INTEGER DEFAULT 0,
  view_mode TEXT DEFAULT 'list' CHECK (view_mode IN ('list', 'kanban', 'timeline')),
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lists_user_id ON lists(user_id);

-- ============================================
-- 3. 文件夹表 (清单分组)
-- ============================================
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS folder_lists (
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  PRIMARY KEY (folder_id, list_id)
);

-- ============================================
-- 4. 任务表
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  list_id UUID REFERENCES lists(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- 子任务支持
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high')),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  due_date DATE,
  due_time TIME,
  start_date DATE,
  repeat_rule TEXT DEFAULT 'none' CHECK (repeat_rule IN ('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom')),
  repeat_custom JSONB, -- 自定义重复规则 {interval, days_of_week, etc.}
  reminder TIMESTAMPTZ,
  location_reminder TEXT, -- 位置提醒
  is_all_day BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]', -- [{name, url, size, type}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- ============================================
-- 5. 标签表
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366F1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);

-- ============================================
-- 6. 任务评论/活动记录
-- ============================================
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. 番茄钟记录
-- ============================================
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  duration_minutes INTEGER DEFAULT 25,
  break_minutes INTEGER DEFAULT 5,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT
);

CREATE INDEX idx_pomodoro_user_id ON pomodoro_sessions(user_id);

-- ============================================
-- 8. 习惯追踪表
-- ============================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '✅',
  color TEXT DEFAULT '#10B981',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  frequency_config JSONB, -- {days_of_week: [1,3,5], times_per_week: 3}
  reminder_time TIME,
  sort_order INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(log_date);

-- ============================================
-- 9. 倒计时表
-- ============================================
CREATE TABLE IF NOT EXISTS countdowns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_date TIMESTAMPTZ NOT NULL,
  icon TEXT DEFAULT '⏰',
  color TEXT DEFAULT '#EF4444',
  is_pinned BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. 共享清单表
-- ============================================
CREATE TABLE IF NOT EXISTS shared_lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, shared_with_id)
);

-- ============================================
-- 11. 过滤器/智能列表
-- ============================================
CREATE TABLE IF NOT EXISTS filters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🔍',
  conditions JSONB NOT NULL, -- [{field, operator, value}]
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. 用户设置
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  default_view TEXT DEFAULT 'all',
  default_priority TEXT DEFAULT 'none',
  first_day_of_week INTEGER DEFAULT 1, -- 0=Sun, 1=Mon
  time_format TEXT DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  date_format TEXT DEFAULT 'yyyy-MM-dd',
  show_completed_tasks BOOLEAN DEFAULT TRUE,
  auto_sort BOOLEAN DEFAULT FALSE,
  pomodoro_duration INTEGER DEFAULT 25,
  pomodoro_break INTEGER DEFAULT 5,
  pomodoro_long_break INTEGER DEFAULT 15,
  notification_enabled BOOLEAN DEFAULT TRUE,
  keyboard_shortcuts JSONB DEFAULT '{}',
  sidebar_order JSONB DEFAULT '["all", "today", "week", "calendar", "tags"]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. 行级安全策略 (RLS)
-- ============================================

-- 启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: 用户只能读写自己的profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Lists: 用户只能操作自己的清单 + 共享的清单
CREATE POLICY "Users can CRUD own lists" ON lists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view shared lists" ON lists FOR SELECT USING (
  EXISTS (SELECT 1 FROM shared_lists WHERE list_id = lists.id AND shared_with_id = auth.uid())
);

-- Folders
CREATE POLICY "Users can CRUD own folders" ON folders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own folder_lists" ON folder_lists FOR ALL USING (
  EXISTS (SELECT 1 FROM folders WHERE id = folder_id AND user_id = auth.uid())
);

-- Tasks: 用户只能操作自己的任务 + 共享清单中的任务
CREATE POLICY "Users can CRUD own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view shared list tasks" ON tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM shared_lists WHERE list_id = tasks.list_id AND shared_with_id = auth.uid())
);
CREATE POLICY "Shared editors can modify tasks" ON tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM shared_lists WHERE list_id = tasks.list_id AND shared_with_id = auth.uid() AND role IN ('editor', 'admin'))
);

-- Tags
CREATE POLICY "Users can CRUD own tags" ON tags FOR ALL USING (auth.uid() = user_id);

-- Task Comments
CREATE POLICY "Users can CRUD own comments" ON task_comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view comments on shared tasks" ON task_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN shared_lists sl ON sl.list_id = t.list_id
    WHERE t.id = task_comments.task_id AND sl.shared_with_id = auth.uid()
  )
);

-- Pomodoro
CREATE POLICY "Users can CRUD own pomodoro" ON pomodoro_sessions FOR ALL USING (auth.uid() = user_id);

-- Habits
CREATE POLICY "Users can CRUD own habits" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own habit_logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);

-- Countdowns
CREATE POLICY "Users can CRUD own countdowns" ON countdowns FOR ALL USING (auth.uid() = user_id);

-- Shared Lists
CREATE POLICY "Users can manage own shared lists" ON shared_lists FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Users can view lists shared with them" ON shared_lists FOR SELECT USING (auth.uid() = shared_with_id);

-- Filters
CREATE POLICY "Users can CRUD own filters" ON filters FOR ALL USING (auth.uid() = user_id);

-- User Settings
CREATE POLICY "Users can CRUD own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 14. 自动更新updated_at触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_countdowns_updated_at BEFORE UPDATE ON countdowns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_filters_updated_at BEFORE UPDATE ON filters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 15. 实时订阅 (可选)
-- ============================================
-- 启用实时功能用于协作
ALTER publication supabase_realtime ADD TABLE tasks;
ALTER publication supabase_realtime ADD TABLE lists;
ALTER publication supabase_realtime ADD TABLE task_comments;
