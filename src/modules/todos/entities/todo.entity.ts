export default class TodoEntity {
    constructor(
        private readonly id: string,
        private readonly title: string,
        private readonly priority: 'low' | 'medium' | 'high',
        private readonly assignee: string,
        private readonly creator: string,
        private readonly active?: boolean,
        private readonly completedAt?: Date,
        private readonly dueDate?: Date,
        private readonly description?: string,
    ) {}
}