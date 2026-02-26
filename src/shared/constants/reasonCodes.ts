/**
 * Reason codes for filter logs. Must match backend enums.
 */

export const GlobalReasonCodes = {
  SCORE_TOO_HIGH: 10001,
  GEO_NOT_ALLOWED: 10002,
} as const;

export const IpRuleReasonCodes = {
  IP_BLACKLIST_MATCHED: 10010,
  IP_WHITELIST_MATCHED: 10011,
} as const;

export const VpnProxyReasonCodes = {
  IP_MISSING: 11003,
  IP_LOOKUP_FAILED: 11004,
  VPN_PROXY_DETECTED: 11005,
  HOSTING_DETECTED: 11006,
  MOBILE_NETWORK_DETECTED: 11007,
  DETECTOR_ERROR: 11008,
} as const;

export const ScreenReasonCodes = {
  ZERO_SCREEN_SIZE: 12009,
  DESKTOP_SCREEN_TOO_SMALL: 12010,
} as const;

export type ReasonCode =
  | (typeof GlobalReasonCodes)[keyof typeof GlobalReasonCodes]
  | (typeof IpRuleReasonCodes)[keyof typeof IpRuleReasonCodes]
  | (typeof VpnProxyReasonCodes)[keyof typeof VpnProxyReasonCodes]
  | (typeof ScreenReasonCodes)[keyof typeof ScreenReasonCodes];

/** Options for the reason filter dropdown: code + i18n key */
export const FILTER_REASON_OPTIONS: { value: ReasonCode; labelKey: string }[] = [
  { value: GlobalReasonCodes.SCORE_TOO_HIGH, labelKey: 'logs.reasonScoreHigh' },
  { value: GlobalReasonCodes.GEO_NOT_ALLOWED, labelKey: 'logs.reasonGeoNotAllowed' },
  { value: IpRuleReasonCodes.IP_BLACKLIST_MATCHED, labelKey: 'logs.reasonIpBlacklist' },
  { value: IpRuleReasonCodes.IP_WHITELIST_MATCHED, labelKey: 'logs.reasonIpWhitelist' },
  { value: VpnProxyReasonCodes.IP_MISSING, labelKey: 'logs.reasonIpMissing' },
  { value: VpnProxyReasonCodes.IP_LOOKUP_FAILED, labelKey: 'logs.reasonIpLookupFailed' },
  { value: VpnProxyReasonCodes.VPN_PROXY_DETECTED, labelKey: 'logs.reasonVpnProxy' },
  { value: VpnProxyReasonCodes.HOSTING_DETECTED, labelKey: 'logs.reasonHostingDetected' },
  { value: VpnProxyReasonCodes.MOBILE_NETWORK_DETECTED, labelKey: 'logs.reasonMobileNetworkDetected' },
  { value: VpnProxyReasonCodes.DETECTOR_ERROR, labelKey: 'logs.reasonDetectorError' },
  { value: ScreenReasonCodes.ZERO_SCREEN_SIZE, labelKey: 'logs.reasonZeroScreenSize' },
  { value: ScreenReasonCodes.DESKTOP_SCREEN_TOO_SMALL, labelKey: 'logs.reasonDesktopScreenTooSmall' },
];
