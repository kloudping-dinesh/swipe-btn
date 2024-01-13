'use client';

import React, { useEffect, useState } from 'react';
import SwipeButton from './swipe-btn';

const WrapperComponent = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <div>
      {isClient ? (
        <SwipeButton
          isDisabled={false}
          mainText="Slide to Bid & Confirm"
          overlayText="Confirmed"
        />
      ) : null}
    </div>
  );
};

export default WrapperComponent;
