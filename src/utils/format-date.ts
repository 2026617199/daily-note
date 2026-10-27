/**
 * 统一的日期格式化工具。
 * 使用手动格式化，避免依赖不同平台的 Intl 行为差异。
 */

function pad(value: number): string {
    return value < 10 ? `0${value}` : String(value);
}

/** 格式化为 `YYYY-MM-DD HH:mm`。 */
export function formatDateTime(timestamp: number): string {
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return '';
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${date} ${time}`;
}

/** 格式化为 `YYYY-MM-DD HH:mm:ss`（详情页使用）。 */
export function formatFullDateTime(timestamp: number): string {
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return '';
    const date = formatDateTime(timestamp);
    return `${date}:${pad(d.getSeconds())}`;
}
