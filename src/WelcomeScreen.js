import React from 'react';

import { Rules } from './Rules';

export const WelcomeScreen = ({ startPlay }) => {
  return (
    <React.Fragment>
      <Rules startPlay={startPlay} />
    </React.Fragment>
  );
};
