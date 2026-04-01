import { createContext, useContext } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const theme = useDarkMode()
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
