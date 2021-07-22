import checkCoordinatesValidity from '../checkCoordinatesValidity';

test('Coords OK with space', () => {
  const input = '-89.132, 179.123';
  const expected = { lat: -89.132, lng: 179.123 };
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords OK with space and brackets', () => {
  const input = '[89.132, -179.123]';
  const expected = { lat: 89.132, lng: -179.123 };
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords OK without space', () => {
  const input = '[0.132,1.123]';
  const expected = { lat: 0.132, lng: 1.123 };
  expect(checkCoordinatesValidity(input)).toEqual(expected);
});

test('Coords OK without space and brackets', () => {
  const input = '0,0';
  const expected = { lat: 0, lng: 0 };
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
