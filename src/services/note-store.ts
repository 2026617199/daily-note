/**
 * 笔记的本地持久化层：封装 AsyncStorage 的读写，
 * 页面不直接操作存储，统一通过本模块访问。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    createNote,
    normalizeDraft,
    parseNotes,
    serializeNotes,
    StorageCorruptedError,
    updateNote,
} from '@/services/note-model';
import type { Note, NoteDraft } from '@/types/note';

const STORAGE_KEY = 'daily-note:notes:v1';

/** 读取全部笔记（按更新时间倒序）。数据损坏时抛出 StorageCorruptedError。 */
export async function listNotes(): Promise<Note[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) {
        // 首次启动：没有数据，返回空列表。
        return [];
    }
    return parseNotes(raw);
}

/** 按 ID 读取单条笔记，不存在时返回 null。 */
export async function getNote(id: string): Promise<Note | null> {
    const notes = await listNotes();
    return notes.find((note) => note.id === id) ?? null;
}

/**
 * 保存笔记：
 * - 传入 existingId 时为更新；
 * - 否则为新增。
 * 返回保存后的完整记录。
 */
export async function saveNote(draft: NoteDraft, existingId?: string): Promise<Note> {
    const normalized = normalizeDraft(draft);
    const now = Date.now();

    if (existingId) {
        const notes = await listNotes();
        const existing = notes.find((note) => note.id === existingId);
        if (!existing) {
            throw new Error('要编辑的记录不存在');
        }
        const updated = updateNote(existing, normalized, now);
        const next = [updated, ...notes.filter((note) => note.id !== existingId)];
        await AsyncStorage.setItem(STORAGE_KEY, serializeNotes(next));
        return updated;
    }

    const created = createNote(normalized, now);
    const notes = await listNotes();
    await AsyncStorage.setItem(STORAGE_KEY, serializeNotes([created, ...notes]));
    return created;
}

/** 删除指定记录。 */
export async function deleteNote(id: string): Promise<void> {
    const notes = await listNotes();
    const next = notes.filter((note) => note.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, serializeNotes(next));
}

/**
 * 清空全部记录。仅在用户明确确认（例如数据损坏后主动选择重置）时调用。
 */
export async function clearAllNotes(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
}

export { StorageCorruptedError };
