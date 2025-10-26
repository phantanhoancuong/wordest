export const useCellAnimationManager = () => {
  const animatingCellNum = useRef(0);
  const finishedCellMap = useRef(new Map());
  const pendingRowIncrement = useRef(false);

  const handleAnimationEnd = (rowIndex, colIndex) => {
    if (!finishedCellMap.current.has(rowIndex)) {
      finishedCellMap.current.set(rowIndex, []);
    }

    finishedCellMap.current.get(rowIndex).push(colIndex);

    animatingCellNum.current = Math.max(0, animatingCellNum.current - 1);

    if (animatingCellNum.current === 0) {
      if (pendingRowIncrement.current) {
        incrementRow();
        pendingRowIncrement.current = false;
      }

      flushAnimation(finishedCellMap.current);
      finishedCellMap.current.clear();
    }
  };

  const addAnimationNum = (count) => {
    animatingCellNum.current += count;
  };

  const setPendingRow = () => {
    pendingRowIncrement.current = true;
  };

  const resetAnimations = () => {
    animatingCellNum.current = 0;
    pendingRowIncrement.current = false;
    finishedCellMap.current.clear();
  };

  return {
    animatingCellNum,
    handleAnimationEnd,
    addAnimationNum,
    setPendingRow,
    resetAnimations,
  };
};
