import { prisma } from './client';
import { Candidate } from '../../types';

export const candidateService = {
  async getAll(): Promise<Candidate[]> {
    return prisma.candidate.findMany({
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        specs: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  },

  async getById(id: number): Promise<Candidate | null> {
    return prisma.candidate.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' }
        },
        specs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  },

  async create(data: {
    name: string;
    location?: string;
    salary?: string;
    roles?: string;
    drives?: boolean;
  }): Promise<Candidate> {
    return prisma.candidate.create({
      data,
      include: {
        notes: true,
        specs: true
      }
    });
  },

  async update(id: number, data: Partial<Candidate>): Promise<Candidate> {
    return prisma.candidate.update({
      where: { id },
      data,
      include: {
        notes: true,
        specs: true
      }
    });
  },

  async findByName(name: string): Promise<Candidate | null> {
    return prisma.candidate.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        }
      },
      include: {
        notes: true,
        specs: true
      }
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.candidate.delete({
      where: { id }
    });
  }
};
