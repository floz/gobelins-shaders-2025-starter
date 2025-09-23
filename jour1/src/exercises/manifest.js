import textureUrl from '/assets/lapin.png';

// Import all shader files as text modules
import helloworldFrag from './helloworld.frag?raw';

export const exercises = [
  {
    id: 'helloworld',
    name: 'Hello world',
    description: 'La ou tout commence',
    fragSource: helloworldFrag,
    uniforms: {
      u_color: { type: 'color', value: [0, 0, 0], gui: true, label: 'Couleur' },
    }
  },
];