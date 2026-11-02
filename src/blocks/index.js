import { transformChart } from '../chart/render.js';
import { transformScale } from './scale.js';
import { transformGallery } from './gallery.js';
import { transformCompare } from './compare.js';
import { transformGlossary } from './glossary.js';

/** Code blocks that turn into HTML, besides `steps`. Each returns `{ output }` lines or `{ errors }`. */
export const BLOCKS = { chart: transformChart, scale: transformScale, gallery: transformGallery, compare: transformCompare, glossary: transformGlossary };
