import { ScanningStep } from '../types';

export const scanService = {
  simulateScanning: (
    onStepUpdate: (steps: ScanningStep[]) => void,
    onComplete: () => void
  ): (() => void) => {
    let currentSteps: ScanningStep[] = [
      {
        id: 1,
        title: 'Image captured',
        subtitle: 'Photo successfully uploaded',
        status: 'completed',
      },
      {
        id: 2,
        title: 'Detecting ingredients',
        subtitle: 'Finding food items in the image',
        status: 'active',
      },
      {
        id: 3,
        title: 'Identifying food items',
        subtitle: 'Using AI vision to recognize ingredients',
        status: 'pending',
      },
      {
        id: 4,
        title: 'Organizing ingredients',
        subtitle: 'Preparing your results',
        status: 'pending',
      },
    ];

    onStepUpdate([...currentSteps]);

    const timer1 = setTimeout(() => {
      currentSteps = [
        { ...currentSteps[0], status: 'completed' },
        { ...currentSteps[1], status: 'completed' },
        { ...currentSteps[2], status: 'active' },
        { ...currentSteps[3], status: 'pending' },
      ];
      onStepUpdate([...currentSteps]);
    }, 1500);

    const timer2 = setTimeout(() => {
      currentSteps = [
        { ...currentSteps[0], status: 'completed' },
        { ...currentSteps[1], status: 'completed' },
        { ...currentSteps[2], status: 'completed' },
        { ...currentSteps[3], status: 'active' },
      ];
      onStepUpdate([...currentSteps]);
    }, 3200);

    const timer3 = setTimeout(() => {
      currentSteps = [
        { ...currentSteps[0], status: 'completed' },
        { ...currentSteps[1], status: 'completed' },
        { ...currentSteps[2], status: 'completed' },
        { ...currentSteps[3], status: 'completed' },
      ];
      onStepUpdate([...currentSteps]);
    }, 4500);

    const timerComplete = setTimeout(() => {
      onComplete();
    }, 5200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerComplete);
    };
  },
};
