export function cls(...classNames: string[]) {
  return classNames.join(" ");
}

export function formatRelativeTime(targetDate: Date): string {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - targetDate.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  const rtf = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });

  if (diffInDays >= 7) {
    // 일주일 이상일 경우 절대 날짜 표시
    return targetDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (diffInDays >= 1) {
    // 1일 이상 7일 미만인 경우 "n일 전"
    return rtf.format(-diffInDays, "day");
  } else if (diffInHours >= 1) {
    // 1시간 이상 24시간 미만인 경우 "n시간 전"
    return rtf.format(-diffInHours, "hour");
  } else if (diffInMinutes >= 1) {
    // 1분 이상 1시간 미만인 경우 "n분 전"
    return rtf.format(-diffInMinutes, "minute");
  } else {
    // 1분 미만인 경우 "방금"
    return "방금";
  }
}
