import { fileNameValidator, nameValidator } from './logger';

describe('nameValidator', () => {
  it('should properly validate a name', () => {
    expect(nameValidator('test')()).toBeUndefined();
  });
  it('should bail on an invalid name', () => {
    expect(nameValidator(undefined)()).toEqual('must supply name');
  });
});

describe('fileNameValidator', () => {
  it('should properly validate a name', () => {
    expect(fileNameValidator('test')()).toBeUndefined();
  });
  it('should bail on an invalid name', () => {
    expect(fileNameValidator(undefined)()).toEqual('must supply fileName');
  });
});
