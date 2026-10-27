/**
 * 记事本核心数据模型。
 * 时间统一使用毫秒级 Unix 时间戳（epoch ms）。
 */
export type Note = {
    /** 稳定且唯一的记录 ID */
    id: string;
    /** 标题 */
    title: string;
    /** 正文 */
    body: string;
    /** 创建时间（epoch ms） */
    createdAt: number;
    /** 更新时间（epoch ms） */
    updatedAt: number;
};

/** 新建/编辑时的输入草稿 */
export type NoteDraft = {
    title: string;
    body: string;
};
