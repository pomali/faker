import { describe, expect, it } from 'vitest';
import { FakerError, faker, fakerEN_CA, fakerEN_US } from '../../src';
import { seededTests } from '../support/seeded-runs';
import { times } from './../support/times';

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180.0);
}

function kilometersToMiles(miles: number) {
  return miles * 0.621371;
}

/**
 * Returns the number of decimal places a number has.
 *
 * @param num The number to check.
 */
function precision(num: number): number {
  const decimalPart = num.toString().split('.')[1];
  if (decimalPart === undefined) {
    return 0;
  }

  return decimalPart.length;
}

// http://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
const EQUATORIAL_EARTH_RADIUS = 6378.137;

function haversine(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
  isMetric: boolean
) {
  const distanceLatitude = degreesToRadians(latitude2 - latitude1);
  const distanceLongitude = degreesToRadians(longitude2 - longitude1);
  const a =
    Math.sin(distanceLatitude / 2) * Math.sin(distanceLatitude / 2) +
    Math.cos(degreesToRadians(latitude1)) *
      Math.cos(degreesToRadians(latitude2)) *
      Math.sin(distanceLongitude / 2) *
      Math.sin(distanceLongitude / 2);
  const distance =
    EQUATORIAL_EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return isMetric ? distance : kilometersToMiles(distance);
}

const NON_SEEDED_BASED_RUN = 5;

describe('location', () => {
  seededTests(faker, 'location', (t) => {
    t.it('street');

    // TODO @xDivisionByZerox 2023-04-16: add street name locale data to `en`
    t.skip('streetName');

    t.it('buildingNumber');

    t.it('secondaryAddress');

    t.describe('streetAddress', (t) => {
      t.it('noArgs')
        .it('with boolean', false)
        .it('with useFullAddress options', { useFullAddress: true });
    });

    t.itEach('city', 'cityName');

    t.it('county');

    t.it('country');

    t.describe('countryCode', (t) => {
      t.it('noArgs')
        .it('with string alpha-2', 'alpha-2')
        .it('with string alpha-3', 'alpha-3')
        .it('with string numeric', 'numeric')
        .it('with variant option alpha-2', { variant: 'alpha-2' })
        .it('with variant option alpha-3', { variant: 'alpha-3' })
        .it('with variant option numeric', { variant: 'numeric' });
    });

    t.describeEach(
      'latitude',
      'longitude'
    )((t) => {
      t.it('noArgs')
        .it('with max', 10)
        .it('with min', undefined, -10)
        .it('with precision', undefined, undefined, 10)
        .it('with max option', { max: 10 })
        .it('with min option', { min: -10 })
        .it('with precision option', { precision: 10 })
        .it('with max and min option', { max: 10, min: -10 })
        .it('with max, min and precision option', {
          max: 10,
          min: -10,
          precision: 10,
        });
    });

    t.describe('nearbyGPSCoordinate', (t) => {
      t.it('noArgs')
        .it('near origin', { origin: [0, 0] })
        .it('with origin and radius', { origin: [37, -13], radius: 15 })
        .it('with origin, radius and isMetric', {
          origin: [37, -13],
          radius: 15,
          isMetric: true,
        })
        .it('with origin and isMetric', { origin: [37, -13], isMetric: true })
        .it('with radius and isMetric', { radius: 15, isMetric: true })
        .it('only radius', { radius: 12 })
        .it('only isMetric', { isMetric: true });
    });

    t.describe('state', (t) => {
      t.it('noArgs').it('with options', { abbreviated: true });
    });

    t.it('stateAbbr');

    t.it('timeZone');

    t.describeEach(
      'direction',
      'cardinalDirection',
      'ordinalDirection'
    )((t) => {
      t.it('noArgs')
        .it('with boolean', false)
        .it('with abbreviated option', { abbreviated: true });
    });

    t.describe('zipCode', (t) => {
      t.it('noArgs')
        .it('with string', '###')
        .it('with format option', { format: '###-###' });
      // These are currently commented out because non-default locales are currently not supported
      // .it('with state option', { state: 'CA' })
      // .it('with options', { state: 'CA', format: '###-###' });
    });

    t.describe('zipCodeByState', (t) => {
      t.it('noArgs');
      // These are currently commented out because non-default locales are currently not supported
      // .it('with string 1', 'CA')
      // .it('with string 2', 'WA')
      // .it('with state options', { state: 'WA' });
    });
  });

  describe.each(times(NON_SEEDED_BASED_RUN).map(() => faker.seed()))(
    'random seeded tests for seed %i',
    () => {
      describe('countryCode()', () => {
        it('returns random alpha-2 countryCode', () => {
          const countryCode = faker.location.countryCode('alpha-2');

          expect(countryCode).toBeTruthy();
          expect(countryCode).toMatch(/^[A-Z]{2}$/);
        });

        it('returns random alpha-3 countryCode', () => {
          const countryCode = faker.location.countryCode('alpha-3');

          expect(countryCode).toBeTruthy();
          expect(countryCode).toMatch(/^[A-Z]{3}$/);
        });

        it('returns random numeric countryCode', () => {
          const countryCode = faker.location.countryCode('numeric');

          expect(countryCode).toBeTruthy();
          expect(countryCode).toMatch(/^\d{3}$/);
        });
      });

      describe('zipCode()', () => {
        it('returns random zipCode - user specified format', () => {
          let zipCode = faker.location.zipCode({ format: '?#? #?#' });

          expect(zipCode).toMatch(/^[A-Za-z]\d[A-Za-z]\s\d[A-Za-z]\d$/);

          // try another format
          zipCode = faker.location.zipCode({ format: '###-###' });

          expect(zipCode).toMatch(/^\d{3}-\d{3}$/);
        });

        it('returns zipCode with proper locale format', () => {
          // we'll use the en_CA locale..
          const zipCode = fakerEN_CA.location.zipCode();

          expect(zipCode).toMatch(/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/);
        });

        it.each([
          ['IL', 60001, 62999],
          ['GA', 30001, 31999],
          ['WA', 98001, 99403],
        ])('returns zipCode valid for state %s', (state, lower, upper) => {
          const zipCode1 = +fakerEN_US.location.zipCode({ state });
          expect(zipCode1).toBeGreaterThanOrEqual(lower);
          expect(zipCode1).toBeLessThanOrEqual(upper);
        });

        it('should return a zip code with length 5 for ZIP codes that start with 0', () => {
          const zipCode = fakerEN_US.location.zipCode({ state: 'NH' });
          expect(zipCode.length).toBe(5);
        });

        it('should throw when definitions.location.postcode_by_state not set', () => {
          expect(() => faker.location.zipCode({ state: 'XX' })).toThrow(
            new FakerError(
              `The locale data for 'location.postcode_by_state' are missing in this locale.
  Please contribute the missing data to the project or use a locale/Faker instance that has these data.
  For more information see https://fakerjs.dev/guide/localization.html`
            )
          );
        });

        it('should throw when definitions.location.postcode_by_state[state] is unknown', () => {
          expect(() => fakerEN_US.location.zipCode({ state: 'XX' })).toThrow(
            new FakerError('No zip code definition found for state "XX"')
          );
        });
      });

      describe('zipCodeByState()', () => {
        it('returns zipCode valid for specified State', () => {
          const states = ['IL', 'GA', 'WA'];

          const zipCode1 = +fakerEN_US.location.zipCodeByState(states[0]);
          expect(zipCode1).toBeGreaterThanOrEqual(60001);
          expect(zipCode1).toBeLessThanOrEqual(62999);

          const zipCode2 = +fakerEN_US.location.zipCodeByState(states[1]);
          expect(zipCode2).toBeGreaterThanOrEqual(30001);
          expect(zipCode2).toBeLessThanOrEqual(31999);

          const zipCode3 = +fakerEN_US.location.zipCodeByState(states[2]);
          expect(zipCode3).toBeGreaterThanOrEqual(98001);
          expect(zipCode3).toBeLessThanOrEqual(99403);
        });
      });

      describe('buildingNumber()', () => {
        it('never starts with a zero', () => {
          const buildingNumber = faker.location.buildingNumber();
          expect(buildingNumber).not.toMatch(/^0/);
        });
      });

      describe('latitude()', () => {
        it('returns a number', () => {
          const latitude = faker.location.latitude();

          expect(latitude).toBeTypeOf('number');
        });

        it('returns random latitude', () => {
          const latitude = faker.location.latitude();

          expect(latitude).toBeGreaterThanOrEqual(-90.0);
          expect(latitude).toBeLessThanOrEqual(90.0);
        });

        it('returns latitude with min and max and default precision', () => {
          const latitude = faker.location.latitude({ max: 5, min: -5 });

          expect(
            precision(latitude),
            'The precision of latitude should be 4 digits'
          ).lessThanOrEqual(4);

          expect(latitude).toBeGreaterThanOrEqual(-5);
          expect(latitude).toBeLessThanOrEqual(5);
        });

        it('returns random latitude with custom precision', () => {
          const latitude = faker.location.latitude({ precision: 7 });

          expect(
            precision(latitude),
            'The precision of latitude should be 7 digits'
          ).lessThanOrEqual(7);

          expect(latitude).toBeGreaterThanOrEqual(-180);
          expect(latitude).toBeLessThanOrEqual(180);
        });
      });

      describe('longitude()', () => {
        it('returns a number', () => {
          const longitude = faker.location.longitude();

          expect(longitude).toBeTypeOf('number');
        });

        it('returns random longitude', () => {
          const longitude = faker.location.longitude();

          expect(longitude).toBeGreaterThanOrEqual(-180);
          expect(longitude).toBeLessThanOrEqual(180);
        });

        it('returns random longitude with min and max and default precision', () => {
          const longitude = faker.location.longitude({ max: 100, min: -30 });

          expect(
            precision(longitude),
            'The precision of longitude should be 4 digits'
          ).lessThanOrEqual(4);

          expect(longitude).toBeGreaterThanOrEqual(-30);
          expect(longitude).toBeLessThanOrEqual(100);
        });

        it('returns random longitude with custom precision', () => {
          const longitude = faker.location.longitude({ precision: 7 });

          expect(
            precision(longitude),
            'The precision of longitude should be 7 digits'
          ).lessThanOrEqual(7);

          expect(longitude).toBeGreaterThanOrEqual(-180);
          expect(longitude).toBeLessThanOrEqual(180);
        });
      });

      describe('direction()', () => {
        it('returns abbreviation when abbreviated is true', () => {
          const direction = faker.location.direction({ abbreviated: true });
          const lengthDirection = direction.length;
          const prefixErrorMessage =
            'The abbreviation of direction when abbreviated is true should';

          expect(
            direction,
            `${prefixErrorMessage} be of type string. Current is ${typeof direction}`
          ).toBeTypeOf('string');
          expect(lengthDirection).toBeLessThanOrEqual(2);
        });
      });

      describe('ordinalDirection()', () => {
        it('returns abbreviation when abbreviated is true', () => {
          const ordinalDirection = faker.location.ordinalDirection({
            abbreviated: true,
          });
          const expectedType = 'string';
          const ordinalDirectionLength = ordinalDirection.length;
          const prefixErrorMessage =
            'The ordinal direction when abbreviated is true should';

          expect(
            ordinalDirection,
            `${prefixErrorMessage} be equal ${expectedType}. Current is ${typeof ordinalDirection}`
          ).toBeTypeOf(expectedType);
          expect(ordinalDirectionLength).toBeLessThanOrEqual(2);
        });
      });

      describe('cardinalDirection()', () => {
        it('returns abbreviation when abbreviated is true', () => {
          const cardinalDirection = faker.location.cardinalDirection({
            abbreviated: true,
          });
          const expectedType = 'string';
          const cardinalDirectionLength = cardinalDirection.length;
          const prefixErrorMessage =
            'The cardinal direction when abbreviated is true should';

          expect(
            cardinalDirection,
            `${prefixErrorMessage} be of type ${expectedType}. Current is ${typeof cardinalDirection}`
          ).toBeTypeOf(expectedType);
          expect(cardinalDirectionLength).toBeLessThanOrEqual(2);
        });
      });

      describe('nearbyGPSCoordinate()', () => {
        it.each(
          times(100).flatMap((radius) => [
            [{ isMetric: true, radius }],
            [{ isMetric: false, radius }],
          ])
        )(
          'should return random gps coordinate within a distance of another one (%j)',
          ({ isMetric, radius }) => {
            const latitude1 = +faker.location.latitude();
            const longitude1 = +faker.location.longitude();

            const coordinate = faker.location.nearbyGPSCoordinate({
              origin: [latitude1, longitude1],
              radius,
              isMetric,
            });

            expect(coordinate.length).toBe(2);
            expect(coordinate[0]).toBeTypeOf('number');
            expect(coordinate[1]).toBeTypeOf('number');

            const latitude2 = coordinate[0];
            expect(latitude2).toBeGreaterThanOrEqual(-90.0);
            expect(latitude2).toBeLessThanOrEqual(90.0);

            const longitude2 = coordinate[1];
            expect(longitude2).toBeGreaterThanOrEqual(-180.0);
            expect(longitude2).toBeLessThanOrEqual(180.0);

            const actualDistance = haversine(
              latitude1,
              longitude1,
              latitude2,
              longitude2,
              isMetric
            );
            expect(actualDistance).toBeLessThanOrEqual(radius);
          }
        );
      });
    }
  );
});
