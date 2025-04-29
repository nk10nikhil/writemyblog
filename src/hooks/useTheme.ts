import { useTheme as useThemeContext } from '@/context/ThemeContext';

function useTheme() {
    return useThemeContext();
}

export { useTheme };
export default useTheme;