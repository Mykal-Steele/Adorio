'use client';

import { useRouter } from 'next/navigation';
import { useIDE } from '../context/IDEContext';

export function useProjectNavigation() {
  const router = useRouter();
  const { addProjectTab } = useIDE();

  const openProject = (id: string) => {
    addProjectTab(id);
    router.push(`/projects/${id}`);
  };

  const prefetchProject = (id: string) => {
    router.prefetch(`/projects/${id}`);
  };

  return { openProject, prefetchProject };
}
