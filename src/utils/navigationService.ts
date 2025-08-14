let navigate: (path: string) => void;

export const setNavigator = (navFn: (path: string) => void) => {
  navigate = navFn;
};

export const navigationRef = (path: string) => {
  if (!navigate) throw new Error("Navigator not set");
  navigate(path);
};