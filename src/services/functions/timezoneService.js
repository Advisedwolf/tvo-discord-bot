// src/services/functions/timezoneService.js
import { DateTime } from 'luxon';
import UserProfile from '../../models/UserProfile.js';

class TimezoneService {
  /**
   * Fetch the user’s saved timezone identifier (IANA zone) or fallback to UTC.
   * Expects UserProfile documents to have a `timezone` field like "Europe/London".
   */
  async getUserZone(userId) {
    const profile = await UserProfile.findOne({ userId }).lean();
    return profile?.timezone || 'UTC';
  }

  /**
   * Given discrete local fields and a zone, build a JS Date in UTC.
   * @param {{year, month, day, hour, minute, zone}} opts
   * @returns {Date}
   */
  toUTC({ year, month, day, hour, minute, zone }) {
    const dt = DateTime.fromObject(
      { year, month, day, hour, minute },
      { zone }
    );
    return dt.toUTC().toJSDate();
  }

  /**
   * Format a stored UTC date back into the user’s locale & timezone.
   * @param {Date} utcDate
   * @param {string} zone   IANA zone, e.g. "Europe/London"
   * @param {string} locale BCP 47 locale, e.g. "en-GB"
   * @returns {string}
   */
  formatForUser(utcDate, zone, locale) {
    return DateTime.fromJSDate(utcDate, { zone: 'utc' })
      .setZone(zone)
      .setLocale(locale)
      .toLocaleString(DateTime.DATETIME_FULL);
  }
}

export default new TimezoneService();
