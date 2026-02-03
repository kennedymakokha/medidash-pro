export  const timeSince = (value: any) => {
    if (!value) return '—';

    let date: Date;

    if (typeof value === 'number') {
        // Unix timestamp in seconds
        date = new Date(value * 1000);
    } else if (typeof value === 'string') {
        // replace space with T and add :00 if missing seconds
        date = new Date(value.replace(' ', 'T'));
    } else {
        return '—';
    }

    if (isNaN(date.getTime())) return '—';

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;

    return 'Just now';
};
