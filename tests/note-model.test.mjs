import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createNote,
    generateId,
    isValidDraft,
    normalizeDraft,
    parseNotes,
    serializeNotes,
    StorageCorruptedError,
    updateNote,
} from '../src/services/note-model.ts';

test('isValidDraft 拒绝空白标题或空白正文', () => {
    assert.equal(isValidDraft({ title: '', body: '内容' }), false);
    assert.equal(isValidDraft({ title: '标题', body: '' }), false);
    assert.equal(isValidDraft({ title: '   ', body: '内容' }), false);
    assert.equal(isValidDraft({ title: '标题', body: '   ' }), false);
    assert.equal(isValidDraft({ title: '标题', body: '内容' }), true);
});

test('normalizeDraft 去除两端空白', () => {
    assert.deepEqual(normalizeDraft({ title: '  标题  ', body: '  正文\n' }), {
        title: '标题',
        body: '正文',
    });
});

test('createNote 生成完整记录', () => {
    const now = Date.now();
    const note = createNote({ title: '标题', body: '正文' }, now);
    assert.equal(note.title, '标题');
    assert.equal(note.body, '正文');
    assert.equal(note.createdAt, now);
    assert.equal(note.updatedAt, now);
    assert.ok(note.id.length > 0);
});

test('updateNote 保持 id 与创建时间，刷新更新时间', () => {
    const note = createNote({ title: '旧标题', body: '旧正文' }, 1000);
    const updated = updateNote(note, { title: '新标题', body: '新正文' }, 2000);
    assert.equal(updated.id, note.id);
    assert.equal(updated.createdAt, 1000);
    assert.equal(updated.updatedAt, 2000);
    assert.equal(updated.title, '新标题');
    assert.equal(updated.body, '新正文');
});

test('generateId 生成的 ID 唯一', () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateId()));
    assert.equal(ids.size, 500);
});

test('parseNotes 正确解析并按更新时间倒序', () => {
    const notes = [
        createNote({ title: 'a', body: 'a' }, 1000),
        createNote({ title: 'b', body: 'b' }, 3000),
        createNote({ title: 'c', body: 'c' }, 2000),
    ];
    const parsed = parseNotes(serializeNotes(notes));
    assert.equal(parsed.length, 3);
    assert.equal(parsed[0].title, 'b');
    assert.equal(parsed[1].title, 'c');
    assert.equal(parsed[2].title, 'a');
});

test('parseNotes 对损坏数据抛出 StorageCorruptedError', () => {
    assert.throws(() => parseNotes('{not json'), StorageCorruptedError);
    assert.throws(() => parseNotes('"just a string"'), StorageCorruptedError);
    assert.throws(() => parseNotes('[{"id":"x"}]'), StorageCorruptedError);
    assert.throws(() => parseNotes('[{"id":"x","title":1,"body":"b","createdAt":1,"updatedAt":1}]'), StorageCorruptedError);
});

test('serializeNotes 与 parseNotes 往返一致', () => {
    const notes = [createNote({ title: '中文 特殊字符 ☕', body: '长\n文\n本' }, 42)];
    const roundTripped = parseNotes(serializeNotes(notes));
    assert.deepEqual(roundTripped, notes);
});
