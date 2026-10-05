import React from 'react';

interface H6Props {
  element?: 'p' | 'span';    
  children: React.ReactNode; 
}


export function H6({ element, children }: H6Props) {
  switch (element) {
    case 'p':
      return (
        <p className='text-lg font-semibold text-slate-700'>{children}</p>
      );
    case 'span': 
      return (
        <span className='text-lg font-semibold text-slate-700'>{children}</span>
      );
    default:
      return (
        <h6 className='text-lg font-semibold text-slate-700'>{children}</h6>
      );
  }
}
