import React from 'react';
import {Button} from './components';

/** Quiet actions retain the same hit area and disabled semantics as other buttons. */
export function TextButton(props: Omit<React.ComponentProps<typeof Button>, 'variant' | 'secondary'>) {
  return <Button {...props} variant="text"/>;
}
