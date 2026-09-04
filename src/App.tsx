import { Provider } from 'react-redux'
import { Toaster } from '@/components/ui/sonner'
import { store } from '@/store'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import { AppRouter } from '@/routes'

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppRouter />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </Provider>
  )
}

export default App
