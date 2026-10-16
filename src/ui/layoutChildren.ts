import {Children,type ReactNode} from 'react';
/** JSX spacing between panels is not a layout item or valid raw native View content. */
export function layoutChildren(children:ReactNode){return Children.toArray(children).filter(child=>typeof child!=='string'||child.trim().length>0);}
