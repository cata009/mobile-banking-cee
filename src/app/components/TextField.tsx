import { useState, useRef, useEffect } from 'react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  helperText2?: string;
  errorText?: string;
  errorText2?: string;
  placeholder?: string;
}

export default function TextField({
  label,
  value,
  onChange,
  helperText,
  helperText2,
  errorText,
  errorText2,
  placeholder = ''
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determină starea curentă
  const hasError = !!(errorText || errorText2);
  const isFilled = value.trim().length > 0;
  const isActive = isFocused && !hasError;
  const showFloatingLabel = isFocused || isFilled;

  // Culori bazate pe stare
  const getLabelColor = () => {
    if (hasError) return '#666';
    if (isActive) return '#007A91';
    if (isFilled) return '#666';
    return '#262626';
  };

  const getDividerColor = () => {
    if (hasError) return '#CF3524';
    if (isActive) return '#007A91';
    return '#262626';
  };

  const getDescriptionColor = () => {
    if (hasError) return '#CF3524';
    return '#666';
  };

  // Culorile description texts
  const showDescription = hasError ? !!(errorText || errorText2) : !!(helperText || helperText2);
  const descriptionText1 = hasError ? errorText : helperText;
  const descriptionText2 = hasError ? errorText2 : helperText2;

  return (
    <div className="w-full">
      {/* Container principal */}
      <div className="relative">
        {/* Floating Label (când focused sau filled) */}
        {showFloatingLabel && (
          <label
            className="font-['UniCredit',sans-serif] block mb-[4px]"
            style={{
              color: getLabelColor(),
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal'
            }}
          >
            {label}
          </label>
        )}

        {/* Input Field Container */}
        <div
          className="relative cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Placeholder Label (când nu e focused și nu are valoare) */}
          {!showFloatingLabel && (
            <div
              className="font-['UniCredit',sans-serif] pointer-events-none"
              style={{
                color: '#262626',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal'
              }}
            >
              {label}
            </div>
          )}

          {/* Input real (vizibil când focused sau filled) */}
          {showFloatingLabel && (
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none font-['UniCredit',sans-serif] p-0"
              style={{
                color: '#262626',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal'
              }}
            />
          )}

          {/* Input ascuns pentru când nu e focused (pentru a captura focus) */}
          {!showFloatingLabel && (
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-text"
            />
          )}
        </div>

        {/* Divider - 4px gap */}
        <div 
          className="mt-[4px] flex-shrink-0"
          style={{
            width: '295px',
            height: '0.5px',
            backgroundColor: getDividerColor()
          }}
        />

        {/* Helper/Error Texts - 6px gap */}
        {showDescription && (
          <div className="mt-[6px] flex flex-col">
            {descriptionText1 && (
              <p
                className="font-['UniCredit',sans-serif]"
                style={{
                  color: getDescriptionColor(),
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal'
                }}
              >
                {descriptionText1}
              </p>
            )}
            {descriptionText2 && (
              <p
                className="font-['UniCredit',sans-serif]"
                style={{
                  color: getDescriptionColor(),
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal'
                }}
              >
                {descriptionText2}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
