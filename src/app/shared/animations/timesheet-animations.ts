import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';

// Expand/collapse animation
export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({
    height: '0',
    overflow: 'hidden',
    opacity: '0',
    padding: '0',
    margin: '0'
  })),
  state('expanded', style({
    height: '*',
    opacity: '1',
    overflow: 'visible',
    padding: '*',
    margin: '*'
  })),
  transition('collapsed <=> expanded', [
    animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
  ])
]);

// Fade in animation
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('400ms ease-in', style({ opacity: 1 }))
  ])
]);

// List stagger animation
export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(12px)' }),
      stagger(80, [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

// Pulse animation for time circles
export const pulseAnimation = trigger('pulse', [
  transition(':enter', [
    style({ transform: 'scale(0.95)', opacity: 0.6 }),
    animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)', 
      style({ transform: 'scale(1)', opacity: 1 }))
  ])
]);

// For timeline connector growing animation
export const timelineGrow = trigger('timelineGrow', [
  transition(':enter', [
    style({ height: 0 }),
    animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ height: '*' }))
  ])
]);

// Rotate icon animation for expand/collapse
export const rotateIcon = trigger('rotateIcon', [
  state('collapsed', style({ transform: 'rotate(0deg)' })),
  state('expanded', style({ transform: 'rotate(180deg)' })),
  transition('expanded <=> collapsed', [
    animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
  ])
]);