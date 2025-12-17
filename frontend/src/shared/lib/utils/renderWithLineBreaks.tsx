import * as React from 'react';

export const renderWithLineBreaks = (text: string): React.ReactNode => {
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ));
};