'use client';

import { useState, useEffect } from 'react';
import { practiceAPI } from '@/lib/api';
import { Practice } from '@/types';

interface UsePracticesOptions {
  page?: number;
  limit?: number;
  subject?: string;
  gradeLevel?: string;
  learningLevel?: string;
  specialNeeds?: boolean;
}

interface UsePracticesResult {
  practices: Practice[];
  loading: boolean;
  error: Error | null;
  total: number;
  totalPages: number;
  refetch: () => void;
}

export function usePractices(options: UsePracticesOptions = {}): UsePracticesResult {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPractices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await practiceAPI.getAll({
        page: options.page || 1,
        limit: options.limit || 9,
        subject: options.subject,
        gradeLevel: options.gradeLevel,
        learningLevel: options.learningLevel,
        specialNeeds: options.specialNeeds,
      });

      setPractices(response.data.data);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPractices();
  }, [
    options.page,
    options.limit,
    options.subject,
    options.gradeLevel,
    options.learningLevel,
    options.specialNeeds,
  ]);

  return {
    practices,
    loading,
    error,
    total,
    totalPages,
    refetch: fetchPractices,
  };
}

export function usePractice(id: string) {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPractice = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await practiceAPI.getById(id);
        setPractice(response.data.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPractice();
    }
  }, [id]);

  return { practice, loading, error };
}