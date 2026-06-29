import { useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export const useScrollToTop = () => {
  const scrollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: false });
      }
    }, [])
  );

  return scrollRef;
};
