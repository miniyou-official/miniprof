export default function DashboardLoading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: '#00000A', fontFamily: 'monospace' }}
    >
      <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00FFFF40', borderTopColor: '#00FFFF' }} />
      <p style={{ color: '#66FFFF', fontSize: '0.85rem' }}>{'Loading your dashboard...'}</p>
    </div>
  );
}
