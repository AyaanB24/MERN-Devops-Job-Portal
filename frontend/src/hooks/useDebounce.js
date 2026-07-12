import { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// useDebounce — delays updating a value until after a specified delay
// ─────────────────────────────────────────────────────────────────────────────

const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
