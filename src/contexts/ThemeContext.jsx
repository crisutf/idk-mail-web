import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const themes = ['light', 'dark', 'ocean']

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('idk-mail-theme') || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    localStorage.setItem('idk-mail-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const setThemeByName = (themeName) => {
    if (themes.includes(themeName)) {
      setTheme(themeName)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeByName, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
