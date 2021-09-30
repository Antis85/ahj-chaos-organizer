import checkCoordinatesValidity from '../checkCoordinatesValidity';

test('Coords OK with space', () => {
  const input = '-89.12345, 179.12345';
  const expected = { latitude: '-89.12345', longitude: '179.12345' };
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords OK with space and brackets', () => {
  const input = '[89.12345, -179.12345]';
  const expected = { latitude: '89.12345', longitude: '-179.12345' };
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords OK without space', () => {
  const input = '[0.12345,1.12345]';
  const expected = { latitude: '0.12345', longitude: '1.12345' };
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords OK without space and brackets', () => {
  const input = '0,0';
  const expected = { latitude: '0.00000', longitude: '0.00000' };
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords not OK with space', () => {
  const input = '-91, 181';
  const expected = {};
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords not OK with space and brackets', () => {
  const input = '[91, -181]';
  const expected = {};
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords not OK without space', () => {
  const input = '[91,-181]';
  const expected = {};
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords not OK without space and brackets', () => {
  const input = '91,181';
  const expected = {};
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords not OK - NaN', () => {
  const input = 'abc,def';
  const expected = {};
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords not OK - NaN', () => {
  const input = 'abc';
  const expected = {};
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords not OK - empty', () => {
  const input = '';
  const expected = {};
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords not OK - empty', () => {
  const input = ' ';
  const expected = {};
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});
