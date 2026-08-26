import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ThemedText from "~/components/ThemedText";
import { useAppTheme } from "~/providers/app-theme-provider";

const CELL_WIDTH = 44;
const CELL_GAP = 4;
const CELL_STEP = CELL_WIDTH + CELL_GAP;
const PADDING_H = 12;

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(d: Date) {
  return d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase();
}

type Props = {
  opensAt?: string | null;
  closesAt?: string | null;
};

export function WideCalendar({ opensAt, closesAt }: Props) {
  const { theme } = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { days, openDay, closeDay, openTime, closeTime } = useMemo(() => {
    const openDate = opensAt ? new Date(opensAt) : null;
    const closeDate = closesAt ? new Date(closesAt) : null;
    const anchor = openDate ?? closeDate;
    const endAnchor = closeDate ?? openDate;

    if (!anchor || !endAnchor) {
      return { days: [], openDay: openDate, closeDay: closeDate, openTime: null, closeTime: null };
    }

    const start = new Date(anchor);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endAnchor);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);

    const result: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      result.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    return {
      days: result,
      openDay: openDate,
      closeDay: closeDate,
      openTime: openDate ? formatTime(openDate) : null,
      closeTime: closeDate ? formatTime(closeDate) : null,
    };
  }, [opensAt, closesAt]);

  useEffect(() => {
    if (containerWidth === 0 || days.length === 0) return;

    const todayIdx = days.findIndex((d) => isSameDay(d, today));

    let scrollX: number;
    if (todayIdx !== -1) {
      const cellCenterX = PADDING_H + todayIdx * CELL_STEP + CELL_WIDTH / 2;
      scrollX = cellCenterX - containerWidth / 2;
    } else if (days[0] && today < days[0]) {
      scrollX = 0;
    } else {
      const contentWidth = days.length * CELL_STEP - CELL_GAP + 2 * PADDING_H;
      scrollX = contentWidth - containerWidth;
    }

    scrollRef.current?.scrollTo({ x: Math.max(0, scrollX), animated: false });
  }, [containerWidth, days, today]);

  if (days.length === 0) return null;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      contentContainerStyle={styles.content}
    >
      {days.map((day, i) => {
        const isOpen = openDay != null && isSameDay(day, openDay);
        const isClose = closeDay != null && isSameDay(day, closeDay);
        const isToday = isSameDay(day, today);
        const isSpecial = isOpen || isClose;

        const numColor = isOpen ? theme.primary : isClose ? theme.warning : theme.baseContent;

        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable ordered date range
          <View key={i} style={styles.cell}>
            <ThemedText style={[styles.weekday, { color: theme.baseContentExtraMuted }]}>
              {day.toLocaleString("en-US", { weekday: "short" })}
            </ThemedText>

            <View
              style={[styles.dayWrap, isToday && !isSpecial && { backgroundColor: theme.base100 }]}
            >
              <ThemedText
                style={[
                  styles.dayNum,
                  { color: numColor, fontWeight: isSpecial || isToday ? "700" : "400" },
                ]}
              >
                {day.getDate()}
              </ThemedText>
            </View>

            <ThemedText style={[styles.month, { color: theme.baseContentExtraMuted }]}>
              {day.toLocaleString("en-US", { month: "short" })}
            </ThemedText>

            {isOpen && (
              <>
                <ThemedText style={[styles.label, { color: theme.primary }]}>Opens</ThemedText>
                {openTime && (
                  <ThemedText style={[styles.time, { color: theme.baseContentMuted }]}>
                    {openTime}
                  </ThemedText>
                )}
              </>
            )}
            {isClose && (
              <>
                <ThemedText style={[styles.label, { color: theme.warning }]}>Closes</ThemedText>
                {closeTime && (
                  <ThemedText style={[styles.time, { color: theme.baseContentMuted }]}>
                    {closeTime}
                  </ThemedText>
                )}
              </>
            )}
            {isToday && !isSpecial && (
              <ThemedText style={[styles.label, { color: theme.baseContentMuted }]}>
                Today
              </ThemedText>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: PADDING_H,
    paddingVertical: 10,
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_WIDTH,
    alignItems: "center",
    gap: 2,
  },
  weekday: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  dayWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNum: {
    fontSize: 14,
  },
  month: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 2,
  },
  time: {
    fontSize: 8,
    fontWeight: "500",
  },
});
