import React, { useState } from 'react';
import type { Project, ProjectMember, MemberRole } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Users, Plus, Trash2, Shield, HardHat, Eye } from '../lucide-icons';

interface ProjectMembersProps {
    project: Project;
    onUpdateMembers: (projectId: string, members: ProjectMember[]) => void;
}

const RoleIcon: React.FC<{ role: MemberRole }> = ({ role }) => {
    switch (role) {
        // FIX: Replaced invalid 'title' prop on Lucide icons with a wrapping span and a valid title attribute for tooltips.
        case 'Admin':
            return <span title="Admin"><Shield size={16} className="text-red-500" /></span>;
        case 'Engineer':
            return <span title="Engineer"><HardHat size={16} className="text-blue-500" /></span>;
        case 'Viewer':
            return <span title="Viewer"><Eye size={16} className="text-gray-500" /></span>;
        default:
            return null;
    }
};

export const ProjectMembers: React.FC<ProjectMembersProps> = ({ project, onUpdateMembers }) => {
    const members = project.data.members || [];
    const [isAdding, setIsAdding] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Engineer' as MemberRole });

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMember.name || !newMember.email) return;
        const memberToAdd: ProjectMember = { ...newMember, id: `user-${uuidv4()}` };
        onUpdateMembers(project.id, [...members, memberToAdd]);
        setIsAdding(false);
        setNewMember({ name: '', email: '', role: 'Engineer' });
    };

    const handleDeleteMember = (memberId: string) => {
        if (window.confirm('Are you sure you want to remove this member from the project?')) {
            onUpdateMembers(project.id, members.filter(m => m.id !== memberId));
        }
    };
    
    return (
        <div>
            <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3"><Users />أعضاء المشروع</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        إدارة فريق العمل لمشروع: <span className="font-semibold">{project.name}</span>
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700"
                >
                    <Plus size={18} /><span>إضافة عضو جديد</span>
                </button>
            </header>

            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                <div className="space-y-3">
                    {members.map(member => (
                        <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-indigo-600">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-sm text-gray-500">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <RoleIcon role={member.role} />
                                    <span>{member.role}</span>
                                </div>
                                <button onClick={() => handleDeleteMember(member.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {isAdding && (
                        <form onSubmit={handleAddMember} className="flex flex-col md:flex-row justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg gap-3">
                            <input type="text" value={newMember.name} onChange={e => setNewMember(prev => ({...prev, name: e.target.value}))} placeholder="الاسم" required className="p-2 rounded bg-white dark:bg-gray-700 w-full md:w-1/4"/>
                            <input type="email" value={newMember.email} onChange={e => setNewMember(prev => ({...prev, email: e.target.value}))} placeholder="البريد الإلكتروني" required className="p-2 rounded bg-white dark:bg-gray-700 w-full md:w-1/4"/>
                            <select value={newMember.role} onChange={e => setNewMember(prev => ({...prev, role: e.target.value as MemberRole}))} className="p-2 rounded bg-white dark:bg-gray-700 w-full md:w-1/4">
                                <option value="Admin">Admin</option>
                                <option value="Engineer">Engineer</option>
                                <option value="Viewer">Viewer</option>
                            </select>
                            <div className="flex gap-2">
                                <button type="submit" className="p-2 bg-green-500 text-white rounded">حفظ</button>
                                <button type="button" onClick={() => setIsAdding(false)} className="p-2 bg-gray-300 dark:bg-gray-600 rounded">إلغاء</button>
                            </div>
                        </form>
                    )}
                </div>
                 {members.length === 0 && !isAdding && <p className="text-center p-8 text-gray-500">لا يوجد أعضاء في هذا المشروع بعد.</p>}
            </div>
        </div>
    );
};