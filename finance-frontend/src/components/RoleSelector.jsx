import { getStoredRole, ROLE_OPTIONS, setStoredRole } from '../services/api';

const roleLabelMap = {
  admin: 'Admin',
  analyst: 'Analyst',
  viewer: 'Viewer',
};

export default function RoleSelector({ onRoleChanged }) {
  const selectedRole = getStoredRole();

  const handleRoleChange = (event) => {
    const nextRole = setStoredRole(event.target.value);

    if (typeof onRoleChanged === 'function') {
      onRoleChanged(nextRole);
      return;
    }

    window.location.reload();
  };

  return (
    <div className="rounded-xl bg-slate-900/30 px-4 py-2 text-right backdrop-blur">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-100/80">Simulated Role</p>
      <select
        aria-label="Role selector"
        className="mt-1 rounded-md border border-white/30 bg-white/90 px-2 py-1 text-sm font-semibold text-slate-800 outline-none"
        value={selectedRole}
        onChange={handleRoleChange}
      >
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {roleLabelMap[role]}
          </option>
        ))}
      </select>
    </div>
  );
}
