/**
 * Seed data for development and testing
 */

import { ListMemoryRepository } from './listMemoryRepository';
import { TaskMemoryRepository } from './taskMemoryRepository';
import { TaskPriority } from '../../types/task.types';

export class SeedData {
  private listRepo: ListMemoryRepository;
  private taskRepo: TaskMemoryRepository;

  constructor() {
    this.listRepo = new ListMemoryRepository();
    this.taskRepo = new TaskMemoryRepository();
  }

  /**
   * Seed the database with sample data
   */
  async seedDatabase(): Promise<void> {
    console.log('🌱 Seeding database with sample data...');

    try {
      // Create sample lists
      const personalList = await this.listRepo.create({
        name: 'Personal Tasks',
        description: 'Personal todos and reminders'
      });

      const workList = await this.listRepo.create({
        name: 'Work Projects',
        description: 'Professional tasks and project items'
      });

      const shoppingList = await this.listRepo.create({
        name: 'Shopping List',
        description: 'Items to buy'
      });

      // Create sample tasks for Personal Tasks
      await this.taskRepo.create(personalList.id, {
        title: 'Book dentist appointment',
        description: 'Call Dr. Smith to schedule annual cleaning',
        priority: TaskPriority.HIGH,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      });

      await this.taskRepo.create(personalList.id, {
        title: 'Plan weekend trip',
        description: 'Research destinations and book accommodation',
        priority: TaskPriority.MEDIUM,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
      });

      await this.taskRepo.create(personalList.id, {
        title: 'Workout routine',
        description: 'Complete 30-minute cardio session',
        priority: TaskPriority.LOW
      });

      // Create sample tasks for Work Projects
      await this.taskRepo.create(workList.id, {
        title: 'Complete project proposal',
        description: 'Finalize the Q4 project proposal document',
        priority: TaskPriority.URGENT,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
      });

      await this.taskRepo.create(workList.id, {
        title: 'Review team performance',
        description: 'Conduct quarterly performance reviews for team members',
        priority: TaskPriority.HIGH,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
      });

      await this.taskRepo.create(workList.id, {
        title: 'Update documentation',
        description: 'Update API documentation with latest changes',
        priority: TaskPriority.MEDIUM
      });

      // Create completed task
      const completedTask = await this.taskRepo.create(workList.id, {
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        priority: TaskPriority.HIGH
      });

      // Mark task as completed
      await this.taskRepo.updateCompletion(completedTask.id, true);

      // Create sample tasks for Shopping List
      await this.taskRepo.create(shoppingList.id, {
        title: 'Buy groceries',
        description: 'Milk, eggs, bread, vegetables',
        priority: TaskPriority.MEDIUM
      });

      await this.taskRepo.create(shoppingList.id, {
        title: 'Pick up dry cleaning',
        description: 'Collect suits from downtown location',
        priority: TaskPriority.LOW,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day from now
      });

      // Create some overdue tasks for testing
      await this.taskRepo.create(personalList.id, {
        title: 'Return library books',
        description: 'Return overdue books to local library',
        priority: TaskPriority.HIGH,
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      });

      console.log('✅ Database seeded successfully with sample data');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  /**
   * Clear all data from the database
   */
  async clearDatabase(): Promise<void> {
    console.log('🗑️  Clearing all data from database...');

    try {
      const { MemoryStore } = await import('./memoryStore');
      MemoryStore.getInstance().clear();
      console.log('✅ Database cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const { MemoryStore } = await import('./memoryStore');
      return MemoryStore.getInstance().getStats();
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      throw error;
    }
  }
}
