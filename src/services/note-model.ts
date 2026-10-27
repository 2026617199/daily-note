/**
 * 笔记的纯逻辑层：不依赖 React Native / AsyncStorage，
 * 便于在 Node 环境下对核心规则进行单元测试。
 */
import type { Note, NoteDraft } from '@/types/note';

/** 生成稳定且唯一的记录 ID。 */
export function generateId(now = Date.now()): string {
    const random = Math.random().toString(36).slice(2, 10);
    return `${now.toString(36)}-${random}`;
}

/** 依据草稿创建一条新记录。 */
export function createNote(draft: NoteDraft, now = Date.now()): Note {
    return {
        id: generateId(now),
        title: draft.title,
        body: draft.body,
        createdAt: now,
        updatedAt: now,
    };
}

/** 依据草稿更新已有记录（保持 id 与创建时间不变，刷新更新时间）。 */
export function updateNote(existing: Note, draft: NoteDraft, now = Date.now()): Note {
    return {
        ...existing,
        title: draft.title,
        body: draft.body,
        updatedAt: now,
    };
}

/** 校验一条草稿是否可保存：标题与正文去空白后均不可为空。 */
export function isValidDraft(draft: NoteDraft): boolean {
    return draft.title.trim().length > 0 && draft.body.trim().length > 0;
}

/** 去掉标题与正文两端的空白字符。 */
export function normalizeDraft(draft: NoteDraft): NoteDraft {
    return {
        title: draft.title.trim(),
        body: draft.body.trim(),
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isNote(value: unknown): value is Note {
    if (!isRecord(value)) return false;
    const { id, title, body, createdAt, updatedAt } = value;
    return (
        typeof id === 'string' &&
        id.length > 0 &&
        typeof title === 'string' &&
        typeof body === 'string' &&
        typeof createdAt === 'number' &&
        Number.isFinite(createdAt) &&
        typeof updatedAt === 'number' &&
        Number.isFinite(updatedAt)
    );
}

/**
 * 解析并校验持久化的 JSON 字符串。
 * - 合法数据：返回笔记数组（按更新时间倒序）。
 * - 数据损坏：抛出 StorageCorruptedError，调用方应告知用户，而不是静默覆盖。
 */
export function parseNotes(raw: string): Note[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new StorageCorruptedError('存储内容不是合法的 JSON');
    }

    if (!Array.isArray(parsed)) {
        throw new StorageCorruptedError('存储内容不是预期的数组结构');
    }

    const notes: Note[] = [];
    for (const item of parsed) {
        if (!isNote(item)) {
            throw new StorageCorruptedError('存储内容包含无法识别的记录');
        }
        notes.push(item);
    }

    // 最新的排在最前面
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}

/** 将笔记数组序列化为 JSON 字符串。 */
export function serializeNotes(notes: Note[]): string {
    return JSON.stringify(notes);
}

/** 存储数据损坏时抛出的错误，用于与普通读取失败区分。 */
export class StorageCorruptedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'StorageCorruptedError';
    }
}
