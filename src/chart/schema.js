// One place for the chart fields, so renderer, check script and skill agree.
export const CHART_TYPES = ['bar', 'line', 'histogram', 'share', 'heatmap', 'waterfall', 'pareto', 'scatter', 'progress', 'kpi'];
export const CHART_FIELDS = ['type', 'x', 'y', 'color', 'percent', 'grouped', 'orientation', 'target', 'label', 'note', 'says', 'basis', 'source'];
export const CHART_REQUIRED = ['type', 'x', 'y', 'says', 'basis'];
export const CHART_VALUES = { percent: ['yes', 'no'], grouped: ['yes', 'no'], orientation: ['vertical', 'horizontal'] };
// Columns a type needs besides x and y.
export const CHART_NEEDS = { progress: ['target'] };
// Rows with these labels are sums. Charts skip them, a waterfall draws them as running totals.
export const TOTAL_LABEL = /^(gesamt|summe|insgesamt|total|sum)$/i;
// A share bar shows at most this many parts and folds the rest into one.
export const SHARE_MAX_PARTS = 6;
// Categorical slots from the dataviz reference palette, validated for CVD on white and #1e1e1e.
// style.less swaps each light value for its dark step.
export const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
// Sequential blue ramp (steps 100 and 600) for heatmaps and the progress track.
export const RAMP = ['#cde2fb', '#184f95'];
export const NEUTRAL = '#8a8a93';
// Light track behind progress bars; style.less swaps it in dark mode.
export const TRACK = '#d6e6fb';
