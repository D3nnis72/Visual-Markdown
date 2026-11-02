// One place for the chart fields, so renderer, check script and skill agree.
export const CHART_TYPES = ['bar', 'line', 'histogram'];
export const CHART_FIELDS = ['type', 'x', 'y', 'color', 'percent', 'orientation', 'says', 'basis'];
export const CHART_REQUIRED = ['type', 'x', 'y', 'says', 'basis'];
export const CHART_VALUES = { percent: ['yes', 'no'], orientation: ['vertical', 'horizontal'] };
// Categorical slots from the dataviz reference palette, validated for CVD on white and #1e1e1e.
// style.less swaps each light value for its dark step.
export const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
