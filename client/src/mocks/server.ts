/**
 * MSW Server Setup
 * Initialize Mock Service Worker for development
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
