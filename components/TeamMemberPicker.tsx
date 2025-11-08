import React, { useState, useMemo } from 'react';
import { X, Search, Check, Users } from 'lucide-react';
import type { ProjectMember } from '../types';
import { getInitials, generateColorFromString, getContrastColor, getRoleBadgeColor } from '../utils/avatarUtils';

interface TeamMemberPickerProps {
    members: ProjectMember[];
    selectedMemberIds: string[];
    onSelectionChange: (memberIds: string[]) => void;
    maxSelection?: number;
    label?: string;
    placeholder?: string;
    className?: string;
}

export const TeamMemberPicker: React.FC<TeamMemberPickerProps> = ({
    members,
    selectedMemberIds,
    onSelectionChange,
    maxSelection,
    label = 'تعيين الأعضاء',
    placeholder = 'ابحث عن الأعضاء...',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const selectedMembers = useMemo(() => {
        return members.filter(m => selectedMemberIds.includes(m.id));
    }, [members, selectedMemberIds]);

    const filteredMembers = useMemo(() => {
        if (!searchQuery) return members;
        const query = searchQuery.toLowerCase();
        return members.filter(
            m =>
                m.name.toLowerCase().includes(query) ||
                m.email.toLowerCase().includes(query) ||
                m.role.toLowerCase().includes(query)
        );
    }, [members, searchQuery]);

    const handleToggleMember = (memberId: string) => {
        if (selectedMemberIds.includes(memberId)) {
            onSelectionChange(selectedMemberIds.filter(id => id !== memberId));
        } else {
            if (maxSelection && selectedMemberIds.length >= maxSelection) {
                return; // Don't add if max reached
            }
            onSelectionChange([...selectedMemberIds, memberId]);
        }
    };

    const handleRemoveMember = (memberId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectionChange(selectedMemberIds.filter(id => id !== memberId));
    };

    const MemberAvatar = ({ member, size = 'md' }: { member: ProjectMember; size?: 'sm' | 'md' | 'lg' }) => {
        const sizeClasses = {
            sm: 'w-6 h-6 text-xs',
            md: 'w-8 h-8 text-sm',
            lg: 'w-10 h-10 text-base',
        };

        const initials = getInitials(member.name);
        const backgroundColor = member.avatarColor || generateColorFromString(member.name);
        const textColor = getContrastColor(backgroundColor);

        if (member.avatar) {
            return (
                <img
                    src={member.avatar}
                    alt={member.name}
                    className={`${sizeClasses[size]} rounded-full object-cover`}
                />
            );
        }

        return (
            <div
                className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold`}
                style={{ backgroundColor, color: textColor }}
            >
                {initials}
            </div>
        );
    };

    return (
        <div className={`relative ${className}`}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </label>

            {/* Selected Members Display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="min-h-[42px] px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
            >
                {selectedMembers.length === 0 ? (
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                        <Users size={16} />
                        <span className="text-sm">لم يتم تعيين أعضاء</span>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {selectedMembers.map(member => (
                            <div
                                key={member.id}
                                className="flex items-center gap-2 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group"
                            >
                                <MemberAvatar member={member} size="sm" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {member.name}
                                </span>
                                <button
                                    onClick={(e) => handleRemoveMember(member.id, e)}
                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 max-h-96 overflow-hidden flex flex-col">
                        {/* Search */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Members List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredMembers.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    لا توجد نتائج
                                </div>
                            ) : (
                                filteredMembers.map(member => {
                                    const isSelected = selectedMemberIds.includes(member.id);
                                    const isDisabled = maxSelection && selectedMemberIds.length >= maxSelection && !isSelected;

                                    return (
                                        <div
                                            key={member.id}
                                            onClick={() => !isDisabled && handleToggleMember(member.id)}
                                            className={`p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                            } ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                                        >
                                            <MemberAvatar member={member} size="md" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {member.name}
                                                    </p>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                                                        {member.role}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {member.email}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <div className="flex-shrink-0 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {maxSelection && (
                            <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 text-center">
                                {selectedMemberIds.length} / {maxSelection} محدد
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TeamMemberPicker;
