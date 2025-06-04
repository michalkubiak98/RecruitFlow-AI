import { prisma } from './client';
import { Note } from '../../types';

export const noteService = {
  async create(candidateId: number, content: string): Promise<Note> {
    return prisma.note.create({
      data: {
        candidateId,
        content
      }
    });
  },

  async getForCandidate(candidateId: number): Promise<Note[]> {
    return prisma.note.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' }
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.note.delete({
      where: { id }
    });
  }
};
