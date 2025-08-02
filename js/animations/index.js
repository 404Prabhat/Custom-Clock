import { clockBasedAnimations } from './clock.js';
import { particleAnimations } from './particle.js';
import { generativeAnimations } from './generative.js';
import { retroAnimations } from './retro.js';
import { artisticAnimations } from './artistic.js';

export const animations = {
    ...clockBasedAnimations,
    ...particleAnimations,
    ...generativeAnimations,
    ...retroAnimations,
    ...artisticAnimations
};
