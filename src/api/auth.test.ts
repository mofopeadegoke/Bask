import { describe, expect, it } from 'vitest';
import type { BackendUser } from '@/lib/types';
import {
  getAuthToken,
  mapBackendUserToFrontendUser,
  mapBackendUserToFrontendUserWithoutUserKey,
} from './auth';

const backendUser: BackendUser = {
  id: 'u1',
  firstName: 'Ada',
  lastName: 'Okafor',
  email: 'ada@example.com',
  accountType: 'Player',
  profilePicture: 'https://res.cloudinary.com/demo/ada.png',
  isEmailVerified: true,
  bio: 'Point guard',
};

describe('mapBackendUserToFrontendUser', () => {
  it('maps the auth response user and keeps the token', () => {
    const user = mapBackendUserToFrontendUser({ user: backendUser, token: 'jwt' });

    expect(user).toMatchObject({
      id: 'u1',
      name: 'Ada Okafor',
      type: 'Player',
      bio: 'Point guard',
      profilePicture: backendUser.profilePicture,
      token: 'jwt',
    });
  });

  it('defaults a missing bio to an empty string', () => {
    const user = mapBackendUserToFrontendUser({ user: { ...backendUser, bio: undefined } });

    expect(user.bio).toBe('');
  });

  it('returns only backend data, the same every time', () => {
    const response = { user: backendUser, token: 'jwt' };
    const user = mapBackendUserToFrontendUser(response);

    expect(mapBackendUserToFrontendUser(response)).toEqual(user);
    expect(Object.keys(user).sort()).toEqual(
      ['bio', 'firstName', 'id', 'lastName', 'name', 'profilePicture', 'token', 'type'],
    );
  });
});

describe('mapBackendUserToFrontendUserWithoutUserKey', () => {
  it('builds the name from first and last name', () => {
    const user = mapBackendUserToFrontendUserWithoutUserKey(backendUser);

    expect(user).toMatchObject({
      id: 'u1',
      name: 'Ada Okafor',
      firstName: 'Ada',
      lastName: 'Okafor',
      type: 'Player',
      bio: 'Point guard',
      profilePicture: backendUser.profilePicture,
    });
  });

  it('treats the string "undefined" as a missing name part', () => {
    const user = mapBackendUserToFrontendUserWithoutUserKey({ id: 'u2', firstName: 'Ada', lastName: 'undefined' });

    expect(user.name).toBe('Ada');
    expect(user.lastName).toBe('');
  });

  it('falls back to name, then "Unknown User"', () => {
    expect(mapBackendUserToFrontendUserWithoutUserKey({ id: 'u3', name: 'Lagos Hawks' }).name).toBe('Lagos Hawks');
    expect(mapBackendUserToFrontendUserWithoutUserKey({ id: 'u4' }).name).toBe('Unknown User');
  });

  it('falls back from accountType to type, then "Fan"', () => {
    expect(mapBackendUserToFrontendUserWithoutUserKey({ id: 'u5', type: 'Scout' }).type).toBe('Scout');
    expect(mapBackendUserToFrontendUserWithoutUserKey({ id: 'u6' }).type).toBe('Fan');
  });

  it('defaults a missing profile picture to null', () => {
    expect(mapBackendUserToFrontendUserWithoutUserKey({ id: 'u7' }).profilePicture).toBeNull();
  });

  it('defaults a missing bio to an empty string instead of mock data', () => {
    expect(mapBackendUserToFrontendUserWithoutUserKey({ id: 'u8' }).bio).toBe('');
  });

  it('returns only backend data, the same every time', () => {
    const user = mapBackendUserToFrontendUserWithoutUserKey(backendUser);

    expect(mapBackendUserToFrontendUserWithoutUserKey(backendUser)).toEqual(user);
    expect(Object.keys(user).sort()).toEqual(
      ['bio', 'firstName', 'id', 'lastName', 'name', 'profilePicture', 'type'],
    );
  });
});

describe('getAuthToken', () => {
  it('returns null outside the browser', () => {
    expect(getAuthToken()).toBeNull();
  });
});
