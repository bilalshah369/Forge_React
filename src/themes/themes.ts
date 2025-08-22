

export type ThemeType = {
  name: string;
  colors: {
    background: string;
    drawerBackgroundColor: string;
    layoutColor: string;
    text: string;
    primary: string;
    complements?: string[];
  };
  font: {
    heading: number;
    subHeading: number;
    text: number;
  };
};

const baseWidth = 1280;
const scaleFontSize = (size: number) => {
  const screenWidth = 1000;
  return size * (screenWidth / baseWidth);
};

export const lightTheme: ThemeType = {
  name: 'light',
  colors: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#007AFF',
    drawerBackgroundColor: '#f5f2f2',
    layoutColor: '#f8f9fa',
  },
  font: {
    // heading: scaleFontSize(16),
    // subHeading: scaleFontSize(14),
    // text: scaleFontSize(12),
    heading: 14,
    subHeading: 14,
    text: 12,
  },
};

export const darkTheme: ThemeType = {
  name: 'dark',
  colors: {
    background: '#000000',
    text: 'white',
    primary: '#FF9500',
    drawerBackgroundColor: 'green',
    layoutColor: '#f8f9fa',
  },
  font: {
    heading: scaleFontSize(16),
    subHeading: scaleFontSize(14),
    text: 14,
  },
};

export const blueTheme: ThemeType = {
  name: 'blue',
  colors: {
    background: '#044086',
    text: 'white',
    primary: '#1976D2',
    drawerBackgroundColor: '#044086',
    complements: ['#136f63', '#963484'],
    layoutColor: '#f8f9fa',
  },
  font: {
    heading: scaleFontSize(16),
    subHeading: scaleFontSize(14),
    text: 14,
  },
};

export const redTheme: ThemeType = {
  name: 'red',
  colors: {
    background: '#FFEBEE',
    text: 'white',
    primary: '#e53935',
    drawerBackgroundColor: 'red',
    layoutColor: '#f8f9fa',
  },
  font: {
    heading: scaleFontSize(16),
    subHeading: scaleFontSize(14),
    text: 14,
  },
};

export const purpleTheme: ThemeType = {
  name: 'purple',
  colors: {
    background: 'purple',
    text: 'white',
    primary: 'purple',
    drawerBackgroundColor: 'purple',
    layoutColor: '#f8f9fa',
  },
  font: {
    heading: scaleFontSize(16),
    subHeading: scaleFontSize(14),
    text: 14,
  },
};
export const darkGreyTheme: ThemeType = {
  name: 'darkgrey',
  colors: {
    background: '#FFEBEE',
    text: 'white',
    primary: '#e53935',
    drawerBackgroundColor: '#595959',
    layoutColor: '#f8f9fa',
  },
  font: {
    heading: scaleFontSize(16),
    subHeading: scaleFontSize(14),
    text: 14,
  },
};
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme,
  red: redTheme,
  purple: purpleTheme,
  darkGrey: darkGreyTheme,
};

export type ThemeNames = keyof typeof themes;
