import type { SessionSummary } from '@application/ports/persistence-port';

type WelcomeScreenProps = {
  sessions: SessionSummary[];
  onCreateSession: () => void;
  onLoadSession: (id: string) => void;
  onImportSession: () => void;
};

export function WelcomeScreen({ sessions, onCreateSession, onLoadSession, onImportSession }: WelcomeScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-lg w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-tight text-[var(--color-base-100)]">
            SwordSound
          </h1>
          <p className="text-[var(--color-base-500)] text-sm mt-1 font-[var(--font-display)]">
            Tactical soundboard for tabletop RPGs
          </p>
          <div className="mt-3 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onCreateSession}
            className="
              w-full px-5 py-3 bg-[var(--color-accent)] text-white
              font-[var(--font-display)] text-sm uppercase tracking-wider
              rounded-sm hover:brightness-110 transition-all
              glow-accent
            "
          >
            New Session
          </button>

          <button
            onClick={onImportSession}
            className="
              w-full px-5 py-3 bg-[var(--color-base-800)] text-[var(--color-base-300)]
              font-[var(--font-display)] text-sm uppercase tracking-wider
              rounded-sm border border-[var(--color-base-700)]
              hover:bg-[var(--color-base-700)] hover:text-[var(--color-base-100)]
              transition-all
            "
          >
            Import Session
          </button>
        </div>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <div className="mt-8">
            <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.2em] text-[var(--color-base-500)] mb-3">
              Recent Sessions
            </h2>
            <div className="space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onLoadSession(session.id)}
                  className="
                    w-full text-left px-4 py-3
                    bg-[var(--color-base-900)] hover:bg-[var(--color-base-800)]
                    border border-[var(--color-base-800)] hover:border-[var(--color-base-700)]
                    rounded-sm transition-all group
                  "
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-base-200)] group-hover:text-[var(--color-base-100)]">
                      {session.name}
                    </span>
                    <span className="text-[10px] font-[var(--font-display)] text-[var(--color-base-600)]">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
