/**
 * Project Service - إدارة المشاريع في Database
 */

import { supabase, getCurrentUser } from '../lib/supabase';
import type { Project } from '../types';

/**
 * الحصول على جميع مشاريع المستخدم
 */
export async function getUserProjects(): Promise<Project[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`خطأ في تحميل المشاريع: ${error.message}`);
  }
  
  return data || [];
}

/**
 * الحصول على مشروع واحد
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }
  
  return data;
}

/**
 * إنشاء مشروع جديد
 */
export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }
  
  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        ...project,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single();
  
  if (error) {
    throw new Error(`خطأ في إنشاء المشروع: ${error.message}`);
  }
  
  return data;
}

/**
 * تحديث مشروع
 */
export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }
  
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`خطأ في تحديث المشروع: ${error.message}`);
  }
  
  return data;
}

/**
 * حذف مشروع
 */
export async function deleteProject(projectId: string): Promise<void> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id);
  
  if (error) {
    throw new Error(`خطأ في حذف المشروع: ${error.message}`);
  }
}

/**
 * نسخ احتياطي لجميع المشاريع
 */
export async function backupAllProjects(): Promise<string> {
  const projects = await getUserProjects();
  
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    projects
  };
  
  return JSON.stringify(backup, null, 2);
}

/**
 * استعادة من نسخة احتياطية
 */
export async function restoreFromBackup(backupJson: string): Promise<number> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }
  
  try {
    const backup = JSON.parse(backupJson);
    
    if (!backup.projects || !Array.isArray(backup.projects)) {
      throw new Error('صيغة النسخة الاحتياطية غير صالحة');
    }
    
    // حذف جميع المشاريع الحالية
    await supabase
      .from('projects')
      .delete()
      .eq('user_id', user.id);
    
    // إضافة المشاريع من النسخة الاحتياطية
    const { error } = await supabase
      .from('projects')
      .insert(
        backup.projects.map((project: any) => ({
          ...project,
          id: undefined, // سيتم توليد ID جديد
          user_id: user.id
        }))
      );
    
    if (error) {
      throw new Error(`خطأ في الاستعادة: ${error.message}`);
    }
    
    return backup.projects.length;
  } catch (error) {
    throw new Error(`فشلت الاستعادة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}

/**
 * البحث في المشاريع
 */
export async function searchProjects(query: string): Promise<Project[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`خطأ في البحث: ${error.message}`);
  }
  
  return data || [];
}

/**
 * الاشتراك في تغييرات المشاريع (Realtime)
 */
export function subscribeToProjects(callback: (payload: any) => void) {
  return supabase
    .channel('projects_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects'
      },
      callback
    )
    .subscribe();
}

/**
 * إحصائيات المشاريع
 */
export async function getProjectStats() {
  const projects = await getUserProjects();
  
  return {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => {
      const budget = p.data?.financials?.reduce((s: number, f: any) => s + (f.total || 0), 0) || 0;
      return sum + budget;
    }, 0)
  };
}
