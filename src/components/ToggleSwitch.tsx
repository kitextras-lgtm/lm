
interface ToggleSwitchProps {
  isActive: boolean;
  onToggle: () => void;
  backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ToggleSwitch({ 
  isActive, 
  onToggle, 
  backgroundTheme = 'dark',
  disabled = false,
  size = 'md'
}: ToggleSwitchProps) {
  const getActiveBackgroundColor = () => {
    switch (backgroundTheme) {
      case 'light':
        return 'bg-slate-700';
      case 'grey':
        return 'bg-zinc-800';
      case 'rose':
        return 'bg-rose-950';
      case 'white':
        return 'bg-slate-700';
      case 'dark':
      default:
        return 'bg-zinc-900';
    }
  };

  const getInactiveBackgroundColor = () => {
    return backgroundTheme === 'white' ? 'bg-gray-300' : 'bg-gray-600';
  };

  const sizeClasses = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-13'
  };

  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const thumbTranslateClasses = {
    sm: isActive ? 'translate-x-4' : 'translate-x-0.5',
    md: isActive ? 'translate-x-6' : 'translate-x-1',
    lg: isActive ? 'translate-x-7' : 'translate-x-1'
  };

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex ${sizeClasses[size]} items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${
        isActive ? getActiveBackgroundColor() : getInactiveBackgroundColor()
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block ${thumbSizeClasses[size]} transform rounded-full bg-white transition-transform duration-200 ${thumbTranslateClasses[size]}`}
      />
    </button>
  );
}
