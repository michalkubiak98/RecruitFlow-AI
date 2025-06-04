import { prisma } from './client';
import { Reminder } from '../../types';
import { addDays } from 'date-fns';

export const reminderService = {
  async create(data: {
    candidateId: number;
    specTrackingId?: number;
    message: string;
    daysFromNow: number;
  }): Promise<Reminder> {
    return prisma.reminder.create({
      data: {
        candidateId: data.candidateId,
        specTrackingId: data.specTrackingId,
        message: data.message,
        dueDate: addDays(new Date(), data.daysFromNow)
      }
    });
  },

  async getDue(): Promise<Reminder[]> {
    return prisma.reminder.findMany({
      where: {
        dueDate: {
          lte: new Date()
        },
        completed: false
      },
      include: {
        candidate: true,
        specTracking: true
      }
    });
  },

  async markComplete(id: number): Promise<void> {
    await prisma.reminder.update({
      where: { id },
      data: { completed: true }
    });
  }
};
