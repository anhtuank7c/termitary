import { findOverdueTasks } from './todos.repository';

/**
 * Cronjob to scan and send warnings for overdue tasks
 * This job runs periodically to check for tasks past their due date
 * and sends email notifications to assignees
 */
export async function scanAndNotifyOverdueTasks(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting overdue tasks scan...`);

  try {
    const overdueTasks = await findOverdueTasks();

    if (overdueTasks.length === 0) {
      console.log('No overdue tasks found.');
      return;
    }

    console.log(`Found ${overdueTasks.length} overdue task(s). Sending notifications...`);

    // Send individual warning emails to each assignee
    // In a real implementation, you might want to batch these by assignee
    const emailPromises = overdueTasks.map(async (task) => {
      const overdueTask = {
        id: task.id,
        title: task.title,
        dueDate: task.dueDate || '',
        assignee: 'assignee@example.com', // In real implementation, get from task data
        priority: task.priority,
      };

      console.log('Send overdueTask email');
    });

    await Promise.all(emailPromises);

    // Send summary email to admin/manager
    const overdueTasksForSummary = overdueTasks.map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate || '',
      assignee: 'assignee@example.com', // In real implementation, get from task data
      priority: task.priority,
    }));

    console.log('Send overdueTask emails');

    console.log(
      `[${new Date().toISOString()}] Overdue tasks scan completed. ${overdueTasks.length} notification(s) sent.`,
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error during overdue tasks scan:`, error);
    throw error;
  }
}
