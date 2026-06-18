import React from 'react';

// Single shimmer block
export const Skeleton = ({ className = '' }) => (
    <div className={`skeleton ${className}`} />
);

// Journal timeline skeleton
export const JournalSkeleton = () => (
    <div className="space-y-4 sm:space-y-6">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 shadow-sm border border-gray-50 flex gap-4 sm:gap-8">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-24 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// Mood tracker skeleton (right panel)
export const MoodSkeleton = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-5 gap-3 sm:gap-6">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-28 sm:h-40 rounded-[24px] sm:rounded-[40px]" />
            ))}
        </div>
        <Skeleton className="h-40 sm:h-48 rounded-[24px] sm:rounded-[40px]" />
        <Skeleton className="h-16 sm:h-20 rounded-[24px] sm:rounded-[40px]" />
    </div>
);

// Generic card skeleton rows
export const CardRowSkeleton = ({ rows = 3 }) => (
    <div className="space-y-4">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                    <Skeleton className="h-3 w-1/2 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);

// Risk assessment skeleton
export const RiskSkeleton = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
                <Skeleton className="h-80 rounded-[48px]" />
            </div>
            <div className="lg:col-span-7 space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-[32px]" />
                ))}
            </div>
        </div>
    </div>
);

export default Skeleton;
