"use client";

export default function PasswordSection({
  oldPassword, setOldPassword,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  showPw, setShowPw,
  pwError,
}: {
  oldPassword: string; setOldPassword: (v: string) => void;
  newPassword: string; setNewPassword: (v: string) => void;
  confirmPassword: string; setConfirmPassword: (v: string) => void;
  showPw: boolean; setShowPw: (v: boolean) => void;
  pwError: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Смена пароля</h2>
      <p className="mb-3 text-xs text-slate-500">Оставьте поля пустыми, если не хотите менять пароль</p>
      <div className="space-y-3">
        <label className="flex flex-col gap-1 max-w-sm">
          <span className="text-xs font-medium text-slate-400">Текущий пароль</span>
          <input type={showPw ? "text" : "password"} value={oldPassword} onChange={e => setOldPassword(e.target.value)}
            autoComplete="off" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
        </label>
        <label className="flex flex-col gap-1 max-w-sm">
          <span className="text-xs font-medium text-slate-400">Новый пароль</span>
          <input type={showPw ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
        </label>
        <label className="flex flex-col gap-1 max-w-sm">
          <span className="text-xs font-medium text-slate-400">Подтвердите новый пароль</span>
          <input type={showPw ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)}
            className="h-4 w-4 accent-red-600" />
          <span className="text-xs text-slate-500">Показать пароли</span>
        </label>
        {pwError && <p className="text-sm text-red-400">{pwError}</p>}
      </div>
    </div>
  );
}
