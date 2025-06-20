
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const DisasterCardShimmer = () => (
  <div className="p-6 border rounded-lg space-y-4">
    <div className="flex justify-between items-start">
      <Skeleton className="h-6 w-3/4" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-16 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-14" />
    </div>
    <Skeleton className="h-4 w-1/3" />
  </div>
);

export const ResourceCardShimmer = () => (
  <div className="p-6 border rounded-lg space-y-4">
    <div className="flex justify-between items-start">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-40" />
    <Skeleton className="h-4 w-32" />
  </div>
);

export const ReportCardShimmer = () => (
  <div className="p-6 border rounded-lg space-y-4">
    <div className="flex justify-between items-start">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-32 w-full" />
    <div className="flex justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

export const UpdateCardShimmer = () => (
  <div className="p-6 border rounded-lg space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-4 w-24" />
  </div>
);

export const ShimmerGrid = ({ 
  count = 6, 
  ShimmerComponent 
}: { 
  count?: number; 
  ShimmerComponent: React.ComponentType;
}) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <ShimmerComponent key={index} />
    ))}
  </div>
);
