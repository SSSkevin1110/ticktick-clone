import type { Priority } from '../types';

/**
 * 自然语言解析结果
 */
interface ParsedTask {
  title: string;
  dueDate?: string;
  dueTime?: string;
  priority: Priority;
  tags: string[];
}

/**
 * 星期映射表
 */
const WEEKDAY_MAP: Record<string, number> = {
  周一: 1, 周二: 2, 周三: 3, 周四: 4, 周五: 5, 周六: 6, 周日: 0,
  星期一: 1, 星期二: 2, 星期三: 3, 星期四: 4, 星期五: 5, 星期六: 6, 星期日: 0,
};

/**
 * 获取今天日期字符串 YYYY-MM-DD
 */
function getToday(): string {
  const now = new Date();
  return formatDate(now);
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 解析日期字符串，返回 YYYY-MM-DD 格式
 */
function parseDateStr(input: string): string | undefined {
  const today = new Date();
  const todayStr = getToday();

  // 今天
  if (input === '今天' || input === '今日') {
    return todayStr;
  }

  // 明天
  if (input === '明天' || input === '明日') {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return formatDate(d);
  }

  // 后天
  if (input === '后天') {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return formatDate(d);
  }

  // 大后天
  if (input === '大后天') {
    const d = new Date(today);
    d.setDate(d.getDate() + 3);
    return formatDate(d);
  }

  // 下周X
  const weekMatch = input.match(/^下周([一二三四五六日天])$/);
  if (weekMatch) {
    const key = `周${weekMatch[1] === '天' ? '日' : weekMatch[1]}`;
    const targetDay = WEEKDAY_MAP[key];
    if (targetDay !== undefined) {
      const d = new Date(today);
      const currentDay = d.getDay();
      // 计算到下周目标星期几的天数
      let daysToAdd = (targetDay - currentDay + 7) % 7;
      if (daysToAdd === 0) daysToAdd = 7; // 如果今天就是目标星期几，移到下周
      daysToAdd += 7; // 下周 = 再加 7 天
      d.setDate(d.getDate() + daysToAdd);
      return formatDate(d);
    }
  }

  // 这周X（周一到周日）
  const thisWeekMatch = input.match(/^(?:这周|本周)([一二三四五六日天])$/);
  if (thisWeekMatch) {
    const key = `周${thisWeekMatch[1] === '天' ? '日' : thisWeekMatch[1]}`;
    const targetDay = WEEKDAY_MAP[key];
    if (targetDay !== undefined) {
      const d = new Date(today);
      const currentDay = d.getDay();
      let daysToAdd = (targetDay - currentDay + 7) % 7;
      d.setDate(d.getDate() + daysToAdd);
      return formatDate(d);
    }
  }

  // X月X日 / X月X号
  const mdMatch = input.match(/^(\d{1,2})月(\d{1,2})[日号]?$/);
  if (mdMatch) {
    const month = parseInt(mdMatch[1], 10);
    const day = parseInt(mdMatch[2], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(today.getFullYear(), month - 1, day);
      // 如果日期已过，推到明年
      if (d < today) {
        d.setFullYear(d.getFullYear() + 1);
      }
      return formatDate(d);
    }
  }

  // YYYY-MM-DD 格式
  const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return input; // 直接返回原格式
  }

  return undefined;
}

/**
 * 解析时间字符串，返回 HH:mm 格式
 */
function parseTimeStr(input: string): string | undefined {
  // 上午/下午 X点 / X点Y分 / X:Y
  const periodMatch = input.match(/^(上午|下午|早上|晚上|凌晨|中午)(\d{1,2})[点:：](\d{1,2})?[分]?$/);
  if (periodMatch) {
    const period = periodMatch[1];
    let hour = parseInt(periodMatch[2], 10);
    const minute = periodMatch[3] ? parseInt(periodMatch[3], 10) : 0;

    if (period === '下午' || period === '晚上') {
      if (hour < 12) hour += 12;
    } else if (period === '上午' || period === '早上' || period === '凌晨') {
      if (hour === 12) hour = 0;
    } else if (period === '中午') {
      if (hour === 12) hour = 12;
      else if (hour < 12) hour = hour; // 中午12点不加
    }

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  // 纯数字时间 HH:MM
  const timeMatch = input.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
  }

  return undefined;
}

/**
 * 解析优先级标记
 * !!!高 或 !高 → high
 * !!中 → medium
 * !低 → low
 */
function parsePriority(input: string): { priority: Priority; cleanTitle: string } {
  // !!!高/中/低 → 三感叹号
  const tripleMatch = input.match(/^!{3}(高|中|低)\s*/);
  if (tripleMatch) {
    const pMap: Record<string, Priority> = { 高: 'high', 中: 'medium', 低: 'low' };
    return { priority: pMap[tripleMatch[1]] || 'high', cleanTitle: input.slice(tripleMatch[0].length) };
  }

  // !!中/高/低 → 双感叹号
  const doubleMatch = input.match(/^!{2}(高|中|低)\s*/);
  if (doubleMatch) {
    const pMap: Record<string, Priority> = { 高: 'high', 中: 'medium', 低: 'low' };
    return { priority: pMap[doubleMatch[1]] || 'medium', cleanTitle: input.slice(doubleMatch[0].length) };
  }

  // !低/高/中 → 单感叹号
  const singleMatch = input.match(/^!(高|中|低)\s*/);
  if (singleMatch) {
    const pMap: Record<string, Priority> = { 高: 'high', 中: 'medium', 低: 'low' };
    return { priority: pMap[singleMatch[1]] || 'low', cleanTitle: input.slice(singleMatch[0].length) };
  }

  return { priority: 'none', cleanTitle: input };
}

/**
 * 解析标签 #标签名
 */
function parseTags(input: string): { tags: string[]; cleanTitle: string } {
  const tags: string[] = [];
  // 匹配所有 #标签名（标签名可以是中文、英文、数字、下划线）
  const cleaned = input.replace(/#([一-龥a-zA-Z0-9_]+)/g, (_match, tag) => {
    tags.push(tag);
    return '';
  }).trim();

  return { tags, cleanTitle: cleaned };
}

/**
 * 自然语言解析主函数
 *
 * 支持解析：
 * - 日期：今天、明天、后天、大后天、下周X、X月X日、YYYY-MM-DD
 * - 时间：下午3点、15:00、上午10:30
 * - 优先级：!高/!!中/!!!低
 * - 标签：#标签名
 *
 * @example
 * parseNaturalLanguage('明天下午3点开会 #工作 !高')
 * // => { title: '开会', dueDate: '2026-06-21', dueTime: '15:00', priority: 'high', tags: ['工作'] }
 */
export function parseNaturalLanguage(input: string): ParsedTask {
  let remaining = input.trim();

  // 1. 解析优先级
  const { priority, cleanTitle: afterPriority } = parsePriority(remaining);
  remaining = afterPriority;

  // 2. 解析标签
  const { tags, cleanTitle: afterTags } = parseTags(remaining);
  remaining = afterTags;

  // 3. 解析日期和时间
  let dueDate: string | undefined;
  let dueTime: string | undefined;

  // 日期关键词列表（从长到短匹配）
  const datePatterns = [
    '大后天', '后天', '明天', '今天', '今日', '明日',
    '下周星期一', '下周星期二', '下周星期三', '下周星期四',
    '下周星期五', '下周星期六', '下周星期日',
    '这周星期一', '这周星期二', '这周星期三', '这周星期四',
    '这周星期五', '这周星期六', '这周星期日',
    '本周星期一', '本周星期二', '本周星期三', '本周星期四',
    '本周星期五', '本周星期六', '本周星期日',
  ];

  // 尝试匹配日期
  for (const pattern of datePatterns) {
    if (remaining.includes(pattern)) {
      const parsed = parseDateStr(pattern);
      if (parsed) {
        dueDate = parsed;
        remaining = remaining.replace(pattern, '').trim();
        break;
      }
    }
  }

  // 如果还没匹配到日期，尝试正则匹配
  if (!dueDate) {
    // 下周X
    const weekMatch = remaining.match(/下周([一二三四五六日天])/);
    if (weekMatch) {
      const key = `周${weekMatch[1] === '天' ? '日' : weekMatch[1]}`;
      const parsed = parseDateStr(`下周${key.replace('周', '')}`);
      if (parsed) {
        dueDate = parsed;
        remaining = remaining.replace(weekMatch[0], '').trim();
      }
    }
  }

  if (!dueDate) {
    // 这周X / 本周X
    const thisWeekMatch = remaining.match(/(?:这周|本周)([一二三四五六日天])/);
    if (thisWeekMatch) {
      const dayChar = thisWeekMatch[1] === '天' ? '日' : thisWeekMatch[1];
      const parsed = parseDateStr(`本周周${dayChar}`);
      if (parsed) {
        dueDate = parsed;
        remaining = remaining.replace(thisWeekMatch[0], '').trim();
      }
    }
  }

  if (!dueDate) {
    // X月X日/X月X号
    const mdMatch = remaining.match(/(\d{1,2})月(\d{1,2})[日号]?/);
    if (mdMatch) {
      const parsed = parseDateStr(`${mdMatch[1]}月${mdMatch[2]}日`);
      if (parsed) {
        dueDate = parsed;
        remaining = remaining.replace(mdMatch[0], '').trim();
      }
    }
  }

  if (!dueDate) {
    // YYYY-MM-DD
    const isoMatch = remaining.match(/(\d{4}-\d{1,2}-\d{1,2})/);
    if (isoMatch) {
      dueDate = isoMatch[1];
      remaining = remaining.replace(isoMatch[0], '').trim();
    }
  }

  // 尝试匹配时间
  // 上午/下午/早上/晚上 X点Y分
  const timeMatch = remaining.match(/(上午|下午|早上|晚上|凌晨|中午)(\d{1,2})[点:：](\d{1,2})?[分]?/);
  if (timeMatch) {
    const parsed = parseTimeStr(timeMatch[0]);
    if (parsed) {
      dueTime = parsed;
      remaining = remaining.replace(timeMatch[0], '').trim();
    }
  }

  if (!dueTime) {
    // 纯数字时间 HH:MM
    const pureTimeMatch = remaining.match(/(\d{1,2}):(\d{2})/);
    if (pureTimeMatch) {
      const parsed = parseTimeStr(pureTimeMatch[0]);
      if (parsed) {
        dueTime = parsed;
        remaining = remaining.replace(pureTimeMatch[0], '').trim();
      }
    }
  }

  // 4. 清理标题：去除多余空格
  const title = remaining.replace(/\s+/g, ' ').trim();

  return {
    title: title || input.trim(), // 如果标题为空，使用原始输入
    dueDate,
    dueTime,
    priority,
    tags,
  };
}
