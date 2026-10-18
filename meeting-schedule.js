const KST_OFFSET = 9 * 60 * 60 * 1000;
const kstDay = timestamp => new Date(timestamp + KST_OFFSET).toISOString().slice(0, 10);

// Without an end time, keep today's meetings available until the day ends in Korea.
export function groupMeetings(meetings, now = Date.now()) {
  const today = kstDay(new Date(now).getTime());
  const upcoming = [], past = [];
  for (const meeting of meetings) {
    const starts = new Date(meeting.starts).getTime();
    (Number.isFinite(starts) && kstDay(starts) < today ? past : upcoming).push(meeting);
  }
  const time = meeting => {
    const value = new Date(meeting.starts).getTime();
    return Number.isFinite(value) ? value : Infinity;
  };
  upcoming.sort((a, b) => time(a) - time(b));
  past.sort((a, b) => time(b) - time(a));
  return {upcoming, past};
}
