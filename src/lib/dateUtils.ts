/**
 * 日期工具函数
 * 提供日期格式化、比较和计算等常用功能
 */

/**
 * 格式化日期
 * @param date 日期对象
 * @param format 格式字符串，支持 YYYY/MM/DD/HH/mm/ss
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return format
    .replace('YYYY', String(year))
    .replace('MM', String(month).padStart(2, '0'))
    .replace('DD', String(day).padStart(2, '0'))
    .replace('HH', String(hours).padStart(2, '0'))
    .replace('mm', String(minutes).padStart(2, '0'))
    .replace('ss', String(seconds).padStart(2, '0'));
}

/**
 * 判断是否是今天
 * @param date 日期对象
 * @returns 是否是今天
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * 判断两个日期是否是同一天
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 是否是同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * 获取指定日期所在周的所有日期（从周一开始）
 * @param date 日期对象
 * @returns 一周的日期数组（7个日期）
 */
export function getWeekDates(date: Date): Date[] {
  const result: Date[] = [];
  const day = date.getDay();
  // 计算到周一的偏移量（周日是0，周一是1...）
  const mondayOffset = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    result.push(d);
  }

  return result;
}

/**
 * 获取月历网格（包含上月和下月补齐的日期）
 * @param date 日期对象
 * @returns 日期数组，包含 isCurrentMonth 标记
 */
export function getMonthDates(date: Date): { date: Date; isCurrentMonth: boolean }[] {
  const result: { date: Date; isCurrentMonth: boolean }[] = [];

  const year = date.getFullYear();
  const month = date.getMonth();

  // 当月第一天
  const firstDay = new Date(year, month, 1);
  // 当月第一天是星期几（0-6，0是周日）
  const firstDayWeekday = firstDay.getDay();
  // 需要补齐的上月天数
  const daysToFillBefore = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1; // 周一为起始

  // 填充上月日期
  for (let i = daysToFillBefore; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    result.push({ date: d, isCurrentMonth: false });
  }

  // 填充当月日期
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    result.push({ date: d, isCurrentMonth: true });
  }

  // 填充下月日期（确保总共有6行，即42天）
  const remaining = 42 - result.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    result.push({ date: d, isCurrentMonth: false });
  }

  return result;
}

/**
 * 格式化相对日期
 * @param dateStr ISO日期字符串（如 2024-01-15）
 * @returns 相对日期描述（今天/明天/后天/X月X日）
 */
export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';

  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays === 2) return '后天';
  if (diffDays === -1) return '昨天';
  if (diffDays === -2) return '前天';

  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 如果是今年，显示 X月X日
  if (date.getFullYear() === today.getFullYear()) {
    return `${month}月${day}日`;
  }

  // 否则显示 YYYY年X月X日
  return `${date.getFullYear()}年${month}月${day}日`;
}

/**
 * 解析日期字符串为 Date 对象
 * @param dateStr 日期字符串（ISO格式 YYYY-MM-DD）
 * @returns Date 对象
 */
export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // 添加时间部分避免时区问题
  return new Date(dateStr + 'T00:00:00');
}

/**
 * 获取星期几的中文名称
 * @param date 日期对象
 * @returns 星期几（如 周一、周日）
 */
export function getWeekdayName(date: Date): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[date.getDay()];
}

/**
 * 将日期格式化为 YYYY-MM-DD 字符串
 * @param date 日期对象
 * @returns YYYY-MM-DD 格式的字符串
 */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取两个日期之间的天数差
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 天数差（date2 - date1）
 */
export function daysBetween(date1: Date, date2: Date): number {
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}
