'use client';

export function SystemLogs() {
  const logs = [
    { time: '12:34:56', message: 'System started.' },
    { time: '12:36:10', message: 'MQTT connected.' },
    { time: '12:40:02', message: 'Relay 3 turned ON.' }
  ];
  return (
    <div className="space-y-2">
      <ul className="list-disc pl-4">
        {logs.map((log, idx) => (
          <li key={idx}>
            <span className="font-mono text-xs">{log.time}</span> —{' '}
            <span>{log.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
