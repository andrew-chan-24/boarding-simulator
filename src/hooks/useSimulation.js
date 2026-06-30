import { useState, useRef, useCallback }              from 'react';
import { BoardingSim }                                from '../simulation/boardingSim';
import { BOARDING_METHODS }                           from '../simulation/boardingOrders';
import { AIRCRAFT, DEFAULT_AIRCRAFT, DEFAULT_COMPOSITION } from '../simulation/constants';

export function useSimulation() {
  const simRef        = useRef(null);
  const [progress,    setProgress]    = useState(null);
  const [isRunning,   setIsRunning]   = useState(false);
  const [methodName,  setMethodName]  = useState('');
  const [aircraftKey, setAircraftKey] = useState(DEFAULT_AIRCRAFT);

  const refreshProgress = useCallback(() => {
    if (simRef.current) setProgress({ ...simRef.current.getProgress() });
  }, []);

  const start = useCallback((method, acKey, composition) => {
    const orderFn  = BOARDING_METHODS[method];
    const aircraft = AIRCRAFT[acKey];
    if (!orderFn || !aircraft) return;
    simRef.current = new BoardingSim(orderFn(aircraft), aircraft, composition);
    setMethodName(method);
    setAircraftKey(acKey);
    setProgress(simRef.current.getProgress());
    setIsRunning(true);
  }, []);

  const pause  = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => {
    if (simRef.current && !simRef.current.done) setIsRunning(true);
  }, []);
  const reset  = useCallback(() => {
    simRef.current = null;
    setProgress(null);
    setIsRunning(false);
    setMethodName('');
  }, []);

  const tick = useCallback((stepsPerFrame = 1) => {
    if (!simRef.current || simRef.current.done) {
      setIsRunning(false);
      return;
    }
    simRef.current.stepN(stepsPerFrame);
    refreshProgress();
    if (simRef.current.done) setIsRunning(false);
  }, [refreshProgress]);

  const stepForward = useCallback(() => {
    if (!simRef.current || simRef.current.done) return;
    setIsRunning(false);
    simRef.current.step();
    refreshProgress();
  }, [refreshProgress]);

  const stepBackward = useCallback(() => {
    if (!simRef.current) return;
    setIsRunning(false);
    if (simRef.current.stepBack()) refreshProgress();
  }, [refreshProgress]);

  return {
    sim : simRef,
    progress,
    isRunning,
    methodName,
    aircraftKey,
    start,
    pause,
    resume,
    reset,
    tick,
    stepForward,
    stepBackward,
  };
}