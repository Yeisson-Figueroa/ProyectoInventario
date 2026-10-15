import React from 'react';

export function FormularioInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  disabled = false,
  icono: Icono,
  className = '',
  min,
  step,
  ...props
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icono && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icono className="w-4 h-4" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          step={step}
          className={`w-full ${Icono ? 'pl-9' : 'px-3.5'} pr-3 py-2 bg-white border ${
            error ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
          } rounded-lg text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export default FormularioInput;
