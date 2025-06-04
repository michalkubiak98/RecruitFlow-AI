import { prisma } from './client';
import { SpecTracking } from '../../types';

export const specService = {
  async create(data: {
    candidateId: number;
    company: string;
    role: string;
    status?: string;
  }): Promise<SpecTracking> {
    return prisma.specTracking.create({
      data,
      include: {
        candidate: true
      }
    });
  },

  async update(id: number, data: Partial<SpecTracking>): Promise<SpecTracking> {
    return prisma.specTracking.update({
      where: { id },
      data,
      include: {
        candidate: true
      }
    });
  },

  async getAll(): Promise<SpecTracking[]> {
    return prisma.specTracking.findMany({
      include: {
        candidate: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getForCandidate(candidateId: number): Promise<SpecTracking[]> {
    return prisma.specTracking.findMany({
      where: { candidateId },
      include: {
        candidate: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};
