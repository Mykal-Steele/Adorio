'use client';
import { ThemeProvider } from 'next-themes';
import { Provider } from 'react-redux';
import store from '@/store/store';

// next-themes ThemeProvider lives here (root level) so its SSR blocking script
// can inject [data-theme] on <html> before React hydrates — zero flash.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="midnight"
      themes={['midnight', 'nord', 'dracula', 'one-dark', 'catppuccin']}
      disableTransitionOnChange
      enableSystem={false}
    >
      <Provider store={store}>{children}</Provider>
    </ThemeProvider>
  );
}
