"use client";

////////////////////////////////////////////////////////////////

import { ThemeOptions, createTheme } from "@mui/material/styles";

export const theme: ThemeOptions = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#10099f',
      },
      secondary: {
        main: '#ffa05f',
      },
      error: {
        main: '#bd3e3e',
      },
      warning: {
        main: '#b76017',
      },
      info: {
        main: '#3b82a8',
      },
      success: {
        main: '#427545',
      },
    },
    typography: {
      h1: {
        fontFamily: "Roboto Mono",
      },
      h2: {
        fontFamily: "Roboto Mono",
      },
      h4: {
        fontFamily: "Roboto Mono",
      },
      h5: {
        fontFamily: "Roboto Mono",
      },
      h6: {
        fontFamily: "Roboto Mono",
        fontWeight: 700,
      },
      h3: {
        fontFamily: "Roboto Mono",
      },
    },
  });
