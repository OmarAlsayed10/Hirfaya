const chatTriggerButton = {
  root: (open: boolean) => ({
    display: open ? 'none' : 'block',
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 999,
  }),
} as const;

export default chatTriggerButton;
