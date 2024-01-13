/* 'use client';
import React, { useState } from 'react';
import SwipeButton from 'react-swipezor';

const SwipeBtn = () => {
  const [reset, setReset] = useState(0);
  return (
    <>
      <SwipeButton
        mainText="Swipe me"
        overlayText="S I K E"
        onSwipeDone={function () {
          console.log('Done!');
        }}
        reset={reset}
      />
      <button
        onClick={() => {
          setReset((counter) => counter + 1);
        }}
      >
        Reset
      </button>
    </>
  );
};

export default SwipeBtn;
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SwipeableHandlers, useSwipeable } from 'react-swipeable';

import styles from './styles.module.scss';
import Image from 'next/image';

interface SwipeButtonProps {
  mainText: React.ReactNode;
  overlayText: React.ReactNode;
  onSwipeDone?: () => void;
  isDisabled: boolean;
  reset?: boolean;
  delta?: number;
  minSwipeWidth?: number;
  minSwipeVelocity?: number;
  caret?: React.ReactNode;
}

const findLeft = (element: HTMLElement | null): number => {
  if (!element) return 0;
  const rec = element.getBoundingClientRect();
  return rec.left + window.scrollX;
};

const SwipeButton = ({
  mainText,
  overlayText,
  onSwipeDone,
  reset,
  delta = 10,
  minSwipeWidth = 0.6,
  minSwipeVelocity = 0.6,
  caret,
  isDisabled,
}: SwipeButtonProps) => {
  const [overlayWidth, setOverlayWidth] = useState<number>(42);
  const [swipeComplete, setSwipeComplete] = useState<boolean>(false);
  const [swipeableHandlers, setSwipeableHandlers] =
    useState<SwipeableHandlers | null>(null);
  const enabledSwipeableHandlers = useSwipeable({
    onSwipeStart: (data) => {
      console.warn('onSwipeStart:', data);
    },
    onSwipedRight: (data) => {
      console.warn('data:', data);
      if (swipeComplete || isDisabled) return;

      const butWidth = buttonRef.current?.offsetWidth || 0;

      if (data.velocity > minSwipeVelocity) {
        setOverlayWidth(butWidth);
        setSwipeComplete(true);
        if (onSwipeDone) setTimeout(() => onSwipeDone(), 100);
      } else {
        const offsetLeft = findLeft(buttonRef.current);
        const startPos = Math.abs(data.initial[0] - offsetLeft);

        if (
          startPos <= 100 &&
          (data.event.type === 'touchend'
            ? data.deltaX - offsetLeft
            : data.deltaX) >
            minSwipeWidth * butWidth
        ) {
          setOverlayWidth(butWidth);
          setSwipeComplete(true);
          if (onSwipeDone) setTimeout(() => onSwipeDone(), 100);
        } else {
          setOverlayWidth(42);
        }
      }
    },
    onSwiping: (data) => {
      console.warn(
        'swipeComplete: ',
        swipeComplete,
        'isDisabled: ',
        isDisabled
      );
      if (swipeComplete || isDisabled) return;

      const offsetLeft = findLeft(buttonRef.current);
      const startPos = Math.abs(data.initial[0] - offsetLeft);

      if (startPos <= 100) {
        if (data.event.type && data.event.type === 'touchmove') {
          setOverlayWidth(data.deltaX - offsetLeft);
        } else {
          setOverlayWidth(data.deltaX);
        }
      }
    },
    delta,
    trackTouch: true,
    trackMouse: true,
    preventScrollOnSwipe: true,
  });
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reset) {
      setSwipeComplete(false);
      setOverlayWidth(42);
    }
  }, [reset]);

  useEffect(() => {
    setSwipeableHandlers(enabledSwipeableHandlers);
  }, [enabledSwipeableHandlers]);

  return (
    <div
      className={`${styles['slide-button-container']} ${
        isDisabled ? styles.disabled : ''
      }`}
      {...swipeableHandlers}
      ref={buttonRef}
    >
      <div
        className={`${styles['sbc-overlay']} ${
          overlayWidth > 42 ? styles.onswipe : ''
        }`}
        style={{ width: overlayWidth }}
      >
        <div className={`${styles['sbc-overlay-wrapper']}`}>
          <div
            className={`${styles['sbc-caret-wrapper']} ${
              overlayWidth > 42 ? styles.onswipe : ''
            }`}
          >
            {caret ? (
              caret
            ) : (
              <div
                className={`${styles.caret} ${
                  isDisabled ? styles.disabled : ''
                } is-flex is-align-items-center is-justify-content-center`}
              >
                <span>&gt; &gt;</span>
              </div>
            )}
          </div>
          <div className={styles['sbc-overlay-txt']}>{overlayText}</div>
        </div>
      </div>
      {mainText}
    </div>
  );
};

export default SwipeButton;

/* 'use client';
TBD: Remove commented code
import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';
import Image from 'next/image';

interface SlideButtonProps {
  onSuccess: () => void;
  onFailure: () => void;
  text: string;
  afterSlideText?: string; // Making afterSlideText optional
}

const SlideButton = ({
  onSuccess,
  onFailure,
  text,
  afterSlideText,
}: SlideButtonProps) => {
  const slider = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  let sliderLeft = 0;
  let startX = 0;

  const containerWidth = container.current
    ? container.current.clientWidth - 50
    : 0;

  const onDrag = (e: MouseEvent | TouchEvent) => {
    if (unlocked || isDragging) return;

    if (isTouchDevice) {
      sliderLeft = Math.min(
        Math.max(0, (e as TouchEvent).touches[0].clientX - startX),
        containerWidth
      );
    } else {
      sliderLeft = Math.min(
        Math.max(0, (e as MouseEvent).clientX - startX),
        containerWidth
      );
    }
    updateSliderStyle();
  };

  const updateSliderStyle = () => {
    if (unlocked || isDragging || !slider?.current) return;
    slider.current.style.left = `${sliderLeft}px`;
  };

  const stopDrag = () => {
    if (unlocked || !isDragging) return;

    setIsDragging(false);

    if (sliderLeft > containerWidth * 0.9) {
      sliderLeft = containerWidth;
      handleSuccess();
    } else {
      sliderLeft = 0;
      if (onFailure) {
        onFailure();
      }
    }

    updateSliderStyle();
  };

  const startDrag = (e: MouseEvent | TouchEvent) => {
    if (unlocked || isDragging) return;

    setIsDragging(true);

    if (isTouchDevice) {
      startX = (e as TouchEvent).touches[0].clientX;
    } else {
      startX = (e as MouseEvent).clientX;
    }
  };

  const handleSuccess = () => {
    if (!container?.current) return;
    container.current.style.width = `${container.current.clientWidth}px`;
    setUnlocked(true);

    if (onSuccess) {
      onSuccess();
    }
  };

  const getText = () => {
    return unlocked ? afterSlideText || 'UNLOCKED' : text || 'SLIDE';
  };

  const reset = () => {
    if (!container.current) return;

    setUnlocked(false);
    sliderLeft = 0;
    updateSliderStyle();
  };

  useEffect(() => {
    const isTouchEnabledDevice = 'ontouchstart' in document.documentElement;
    setIsTouchDevice(isTouchEnabledDevice);
    const handleTouchMove = (e: TouchEvent) => onDrag(e);
    const handleTouchEnd = () => stopDrag();
    const handleMouseMove = (e: MouseEvent) => onDrag(e);
    const handleMouseUp = () => stopDrag();

    if (isTouchDevice) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (isTouchDevice) {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isDragging, unlocked, isTouchDevice]);

  return (
    <div
      className={styles['swipe-button-container']}
      role="button"
      tabIndex={0}
      ref={slider}
      onMouseDown={(e) => startDrag(e as unknown as MouseEvent)}
      onTouchStart={(e) => startDrag(e as unknown as TouchEvent)}
    >
      <div className="overlay">
        <div className="overlay-wrapper">
          <div className="caret-wrapper">
            <Image width={42} height={42} alt='Slider pulley' src={`/${process.env.NEXT_PUBLIC_BASE_PATH}/static/images/icon/pulley.svg`}/>
          </div>
          <div className="overlay-txt">{afterSlideText}</div>
        </div>
      </div>
      {text}
    </div>
  );
};

export default SlideButton; */

{
  /* <div
        className={`${styles.rsbContainer} ${
          unlocked ? styles.rsbContainerUnlocked : ''
        }`}
        ref={container}
      >
        <div
          className={styles.rsbcSlider}
          role="button"
          tabIndex={0}
          ref={slider}
          onMouseDown={(e) => startDrag(e as unknown as MouseEvent)}
          onTouchStart={(e) => startDrag(e as unknown as TouchEvent)}
        >
          <span className={styles.rsbcSliderText}>{getText()}</span>
          <span className={styles.rsbcSliderArrow}></span>
          <span
            className={styles.rsbcSliderCircle}
          ></span>
        </div>
        <div className={styles.rsbcText}>{getText()}</div>
      </div> */
}
