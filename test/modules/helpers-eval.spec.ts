import { describe, expect, it, vi } from 'vitest';
import { faker, FakerError } from '../../src';
import { fakeEval } from '../../src/modules/helpers/eval';

describe('fakeEval()', () => {
  it('does not allow empty string input', () => {
    expect(() => fakeEval('', faker)).toThrowError(
      new FakerError('Eval expression cannot be empty.')
    );
  });

  it('supports single pattern part invocations', () => {
    const actual = fakeEval('string', faker);
    expect(actual).toBeTypeOf('object');
    expect(actual).toBe(faker.string);
  });

  it('supports simple method calls', () => {
    const spy = vi.spyOn(faker.string, 'numeric');
    const actual = fakeEval('string.numeric', faker);
    expect(spy).toHaveBeenCalledWith();
    expect(actual).toBeTypeOf('string');
    expect(actual).toMatch(/^\d$/);
  });

  it('supports method calls without arguments', () => {
    const spy = vi.spyOn(faker.string, 'numeric');
    const actual = fakeEval('string.numeric()', faker);
    expect(spy).toHaveBeenCalledWith();
    expect(actual).toBeTypeOf('string');
    expect(actual).toMatch(/^\d$/);
  });

  it('supports method calls with simple arguments', () => {
    const spy = vi.spyOn(faker.string, 'numeric');
    const actual = fakeEval('string.numeric(5)', faker);
    expect(spy).toHaveBeenCalledWith(5);
    expect(actual).toBeTypeOf('string');
    expect(actual).toMatch(/^\d{5}$/);
  });

  it('supports method calls with complex arguments', () => {
    const spy = vi.spyOn(faker.string, 'numeric');
    const actual = fakeEval(
      'string.numeric({ "length": 5, "allowLeadingZeros": true, "exclude": ["5"] })',
      faker
    );
    expect(spy).toHaveBeenCalledWith({
      length: 5,
      allowLeadingZeros: true,
      exclude: ['5'],
    });
    expect(actual).toBeTypeOf('string');
    expect(actual).toMatch(/^[0-46-9]{5}$/);
  });

  it('supports method calls with multiple arguments', () => {
    const spy = vi.spyOn(faker.helpers, 'mustache');
    const actual = fakeEval(
      'helpers.mustache("{{foo}}", { "foo": "bar" })',
      faker
    );
    expect(spy).toHaveBeenCalledWith('{{foo}}', { foo: 'bar' });
    expect(actual).toBeTypeOf('string');
    expect(actual).toBe('bar');
  });

  it('supports method calls with unquoted string argument', () => {
    const spy = vi.spyOn(faker.helpers, 'slugify');
    const actual = fakeEval('helpers.slugify(This Works)', faker);
    expect(spy).toHaveBeenCalledWith('This Works');
    expect(actual).toBeTypeOf('string');
    expect(actual).toBe('This-Works');
  });

  it('should be able to return empty strings', () => {
    const actual = fakeEval('string.alphanumeric(0)', faker);
    expect(actual).toBeTypeOf('string');
    expect(actual).toBe('');
  });

  it('supports returning complex objects', () => {
    const actual = fakeEval('airline.airline', faker);
    expect(actual).toBeTypeOf('object');
    expect(faker.definitions.airline.airline).toContain(actual);
  });

  it('supports patterns after a function call', () => {
    const actual = fakeEval('airline.airline().name', faker);
    expect(actual).toBeTypeOf('string');
    expect(faker.definitions.airline.airline.map(({ name }) => name)).toContain(
      actual
    ); // function().name
  });

  it('supports patterns after a function reference', () => {
    const actual = fakeEval('airline.airline.iataCode', faker);
    expect(actual).toBeTypeOf('string');
    expect(
      faker.definitions.airline.airline.map(({ iataCode }) => iataCode)
    ).toContain(actual);
  });

  it('requires a dot after a function call', () => {
    expect(() => fakeEval('airline.airline()iataCode', faker)).toThrowError(
      new FakerError(
        "Expected dot ('.'), open parenthesis ('('), or nothing after function call but got 'i'"
      )
    );
  });

  it('requires a valid expression', () => {
    expect(() => fakeEval('foo.bar', faker)).toThrow(
      new FakerError(`Cannot resolve expression 'foo.bar'`)
    );
  });
});
