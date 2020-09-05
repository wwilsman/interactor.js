import Typography from 'typography';

const typography = new Typography({
  baseFontSize: '18px',
  baseLineHeight: 1.825,
  headerFontFamily: [
    'Roboto',
    'sans-serif'
  ],
  bodyFontFamily: [
    'Roboto',
    'sans-serif'
  ],
  googleFonts: [
    {
      name: 'Roboto',
      styles: [
        '400',
        '400i',
        '500',
        '700',
        '700i'
      ]
    }
  ]
});

export default typography;
