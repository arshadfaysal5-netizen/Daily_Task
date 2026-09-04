const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');

const taskService = require('../services/taskService');

describe('TaskService', () => {
  describe('formatTask', () => {
    it('should return null for null input', () => {
      const result = taskService.formatTask(null);
      assert.equal(result, null);
    });

    it('should calculate subtaskProgress correctly', () => {
      const task = {
        toJSON: () => ({
          id: 1,
          title: 'Test',
          subtasks: [
            { id: '1', title: 'A', completed: true },
            { id: '2', title: 'B', completed: false },
            { id: '3', title: 'C', completed: true },
          ],
          dueDate: '2099-12-31',
          status: 'pending',
        }),
      };

      const result = taskService.formatTask(task);
      assert.equal(result.subtaskProgress, 67);
    });

    it('should set subtaskProgress to 0 when no subtasks', () => {
      const task = {
        toJSON: () => ({
          id: 1,
          title: 'Test',
          subtasks: [],
          dueDate: '2099-12-31',
          status: 'pending',
        }),
      };

      const result = taskService.formatTask(task);
      assert.equal(result.subtaskProgress, 0);
    });

    it('should set isOverdue correctly for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const dateStr = pastDate.toISOString().split('T')[0];

      const task = {
        toJSON: () => ({
          id: 1,
          title: 'Test',
          subtasks: [],
          dueDate: dateStr,
          status: 'pending',
        }),
      };

      const result = taskService.formatTask(task);
      assert.equal(result.isOverdue, true);
    });

    it('should set isOverdue to false for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const dateStr = futureDate.toISOString().split('T')[0];

      const task = {
        toJSON: () => ({
          id: 1,
          title: 'Test',
          subtasks: [],
          dueDate: dateStr,
          status: 'pending',
        }),
      };

      const result = taskService.formatTask(task);
      assert.equal(result.isOverdue, false);
    });

    it('should set isOverdue to false for completed tasks', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const dateStr = pastDate.toISOString().split('T')[0];

      const task = {
        toJSON: () => ({
          id: 1,
          title: 'Test',
          subtasks: [],
          dueDate: dateStr,
          status: 'completed',
        }),
      };

      const result = taskService.formatTask(task);
      assert.equal(result.isOverdue, false);
    });
  });

  describe('createTask', () => {
    it('should create a task record', async () => {
      const { Task } = require('../models');
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        priority: 'high',
        status: 'pending',
        dueDate: '2026-12-31',
      };

      const originalCreate = Task.create;
      Task.create = async (data) => ({
        id: 'test-uuid',
        ...data,
        subtasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON() {
          return { id: this.id, ...data, subtasks: [], createdAt: this.createdAt, updatedAt: this.updatedAt };
        },
      });

      try {
        const result = await taskService.createTask(taskData);
        assert.equal(result.title, 'Test Task');
        assert.equal(result.priority, 'high');
      } finally {
        Task.create = originalCreate;
      }
    });
  });
});
