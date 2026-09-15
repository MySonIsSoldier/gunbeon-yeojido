import {
  assessPlan,
  defaultSettings,
  manualToPlace,
  planSchedule,
  resolveEntry,
  validCoord,
  validManualPlace,
} from './domain.ts';
import type { Entry, Place } from './domain.ts';

/** A read projection: no wall-clock countdown, current form values or writes. */
export function itineraryView(entry: Entry, places: Place[], shared = false) {
  const plan = entry.plan;
  const candidates = [
    ...(plan?.manualPlaces || []).filter(validManualPlace).map(manualToPlace),
    ...places,
  ];
  const stops = (plan?.stops || []).map((stop) => ({
    ...stop,
    place: candidates.find((p) => p.id === stop.placeId),
  }));
  const origin = candidates.find((p) => p.id === plan?.originId);
  const resolved = resolveEntry(entry, places);
  const start = Date.parse(plan?.departureAt || '');
  const dated = Number.isFinite(start);
  const settings = {
    ...defaultSettings(new Date(dated ? start : 0)),
    weather: 'unknown' as const,
    ...(plan?.conditions || {}),
  };
  const routable =
    dated &&
    plan?.transport &&
    plan.transport !== 'unknown' &&
    resolved?.origin &&
    resolved.mission.stops.length > 0 &&
    resolved.mission.stops.every((s) => validCoord(s.place));
  const schedule = routable
    ? planSchedule(resolved.mission, settings, resolved.origin!)
    : null;
  // Shared itineraries never inherit a personal deadline or another trip's conditions.
  const score =
    !shared && routable && plan?.timeBudgetMinutes && plan.conditions
      ? assessPlan(resolved.mission, settings, resolved.origin!)
      : null;
  const deadline =
    !shared && dated && plan?.timeBudgetMinutes
      ? start + plan.timeBudgetMinutes * 60000
      : null;
  return {
    stops,
    origin,
    mission: resolved?.mission,
    start: dated ? start : null,
    schedule,
    score,
    deadline,
    stay: stops.reduce((n, s) => n + s.stay, 0),
    walk: stops.reduce((n, s) => n + s.walk, 0),
  };
}
