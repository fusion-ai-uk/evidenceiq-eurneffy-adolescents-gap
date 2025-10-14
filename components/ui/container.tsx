'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type ContainerProps = React.ComponentProps<'div'> & {
  size?: 'sm' | 'md' | 'lg'
}

export function Container({ className, size = 'lg', ...props }: ContainerProps) {
  const maxWidth = size === 'sm'
    ? 'max-w-[900px]'
    : size === 'md'
      ? 'max-w-[1100px]'
      : 'max-w-[1280px]'

  return (
    <div className={cn('mx-auto w-full px-5 md:px-10 xl:px-16', maxWidth, className)} {...props} />
  )
}


